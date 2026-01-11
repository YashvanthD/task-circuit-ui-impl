import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, InputLabel, FormControl, Stack, Chip, Grid,
  CircularProgress, InputAdornment, useMediaQuery, useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Hooks
import { useDialog, useConfirmDialog } from '../../hooks';

// Common components
import { ConfirmDialog } from '../../components/common';
import TaskCard from '../../components/TaskCard';

// Utils
import { getUserInfo, listAccountUsers } from '../../utils/user';
import { fetchAllTasks, saveTask, deleteTask, saveTasks, getTasks, updateTask } from '../../utils/tasks';
import { getDefaultEndDate } from '../../utils/helpers/date';

// ============================================================================
// Constants
// ============================================================================

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'pending',
  priority: '3',
  assigned_to: '',
  end_date: getDefaultEndDate(),
  task_date: '',
  notes: '',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [1, 2, 3, 4, 5];

// ============================================================================
// Helper Functions
// ============================================================================

function resolveTaskId(task) {
  if (!task) return undefined;
  const rawId = task.taskId || task.task_id || task.id || task._id;
  return rawId != null ? String(rawId) : undefined;
}

function getNextAction(status) {
  switch (status) {
    case 'pending': return 'Start';
    case 'inprogress': return 'Resolve';
    case 'completed': return 'Resolved';
    default: return 'Next';
  }
}

function getNextStatus(currentStatus) {
  switch (currentStatus) {
    case 'pending': return 'inprogress';
    case 'inprogress': return 'completed';
    default: return currentStatus;
  }
}

function computeTaskStats(tasks) {
  return tasks.reduce((acc, t) => {
    if (t.status === 'completed') acc.completed++;
    else if (t.status === 'inprogress') acc.inprogress++;
    else acc.pending++;
    acc.total++;
    return acc;
  }, { total: 0, completed: 0, inprogress: 0, pending: 0 });
}


// ============================================================================
// TaskFormDialog Component
// ============================================================================

function TaskFormDialog({ open, onClose, form, onChange, onSubmit, userOptions, selfUser, error, onDelete }) {
  const isEdit = !!form.task_id;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Task' : 'Create Task'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label={<span>Title <span style={{color:'red'}}>*</span></span>}
              name="title"
              value={form.title}
              onChange={onChange}
              required
              fullWidth
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={onChange}
              multiline
              rows={2}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={form.status} label="Status" onChange={onChange}>
                {STATUS_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select name="priority" value={form.priority} label="Priority" onChange={onChange}>
                {PRIORITY_OPTIONS.map(p => (
                  <MenuItem key={p} value={String(p)}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Assigned To *</InputLabel>
              <Select name="assigned_to" value={form.assigned_to} label="Assigned To *" onChange={onChange} required>
                {userOptions.map(u => (
                  <MenuItem key={u.user_key} value={u.user_key}>
                    {u.username || u.user_key}{selfUser?.user_key === u.user_key ? ' (You)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={<span>End Date (YYYY-MM-DD) <span style={{color:'red'}}>*</span></span>}
              name="end_date"
              value={form.end_date}
              onChange={onChange}
              required
              fullWidth
            />
            <TextField
              label="Task Date (YYYY-MM-DD)"
              name="task_date"
              value={form.task_date}
              onChange={onChange}
              fullWidth
            />
            <TextField
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={onChange}
              multiline
              rows={2}
              fullWidth
            />
            {error && <Typography color="error">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          {isEdit && (
            <Button onClick={onDelete} variant="contained" color="error" sx={{ mr: 'auto' }}>
              Delete
            </Button>
          )}
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function TasksPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // User info
  const rawUserInfo = getUserInfo();
  const selfUserKey = rawUserInfo?.userKey || rawUserInfo?.user_key || '';
  const selfUserName = rawUserInfo?.user?.username || rawUserInfo?.username || 'Self (You)';
  const selfUser = selfUserKey ? { user_key: String(selfUserKey), username: selfUserName } : null;

  // State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userOptions, setUserOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Dialogs
  const formDialog = useDialog();
  const deleteConfirm = useConfirmDialog();

  // Form state
  const [form, setForm] = useState({ ...INITIAL_FORM, assigned_to: selfUser?.user_key || '' });
  const [formError, setFormError] = useState('');

  // Computed values
  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Status filter
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(term);
        const matchDesc = t.description?.toLowerCase().includes(term);
        const matchId = t.task_id?.toLowerCase().includes(term);
        if (!matchTitle && !matchDesc && !matchId) return false;
      }

      // Hide old completed tasks (over 1 hour) unless searching or filtering by completed
      if (t.status === 'completed' && t.end_date && !searchTerm && filterStatus !== 'completed') {
        const now = new Date();
        const end = new Date(t.end_date.replace(' ', 'T'));
        if ((now - end) > 3600000) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort: completed tasks at the end
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      return 0;
    });
  }, [tasks, filterStatus, searchTerm]);

  // Load tasks
  const loadTasks = useCallback(async (force = false) => {
    setLoading(true);
    setError('');
    try {
      const data = force ? await fetchAllTasks() : await getTasks();
      console.log('[TasksPage] Loaded tasks:', data?.length || 0);
      setTasks(data || []);
      if (data) await saveTasks(data);
    } catch (err) {
      console.error('[TasksPage] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load users when dialog opens
  useEffect(() => {
    if (!formDialog.open) return;
    listAccountUsers().then(users => {
      const normalized = (users || []).map(u => ({ ...u, user_key: String(u.user_key || u.userKey) }));
      const options = selfUser
        ? [selfUser, ...normalized.filter(u => u.user_key !== selfUser.user_key)]
        : normalized;
      setUserOptions(options);
    }).catch(err => {
      console.error('[TasksPage] Load users error:', err);
    });
  }, [formDialog.open, selfUser]);

  // Initial load
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (task) => {
    setForm({
      ...task,
      priority: String(task.priority || 3),
      end_date: task.end_date || getDefaultEndDate(),
      task_date: task.task_date || '',
      notes: task.notes || '',
      task_id: resolveTaskId(task),
    });
    setFormError('');
    formDialog.openDialog(task);
  };

  const handleCreate = () => {
    setForm({ ...INITIAL_FORM, assigned_to: selfUser?.user_key || '' });
    setFormError('');
    formDialog.openDialog();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const submitData = { ...form };
    if (!submitData.assigned_to && selfUser) submitData.assigned_to = selfUser.user_key;
    if (!submitData.title || !submitData.assigned_to || !submitData.end_date) {
      setFormError('Fields marked * are required');
      return;
    }

    submitData.priority = parseInt(submitData.priority, 10) || 3;
    delete submitData._id;

    try {
      await saveTask(submitData, !!submitData.task_id);
      formDialog.closeDialog();
      setForm(INITIAL_FORM);
      await loadTasks(true); // Force refresh after save
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleNextAction = async (task) => {
    if (task.status === 'completed') return;
    const id = resolveTaskId(task);
    if (!id) return;

    try {
      await updateTask(id, { status: getNextStatus(task.status) });
      await loadTasks(true); // Force refresh
    } catch (err) {
      console.error('handleNextAction error:', err);
    }
  };

  const handleDelete = async (task) => {
    const id = resolveTaskId(task);
    if (!id) return;

    try {
      await deleteTask(id);
      deleteConfirm.closeConfirm();
      formDialog.closeDialog();
      await loadTasks(true); // Force refresh
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getUsername = (userKey) => {
    const user = userOptions.find(u => u.user_key === userKey);
    return user?.username || userKey || 'Unknown';
  };

  return (
    <Paper sx={{ padding: 4, maxWidth: 1280, margin: '40px auto' }}>
      {/* Top bar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Chip label={`Total: ${stats.total}`} color="primary" size="small" />
          <Chip label={`Completed: ${stats.completed}`} color="success" size="small" />
          <Chip label={`In Progress: ${stats.inprogress}`} color="info" size="small" />
          <Chip label={`Pending: ${stats.pending}`} color="default" size="small" />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              {STATUS_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Create New Task
        </Button>
      </Stack>

      {/* Search */}
      <TextField
        label="Search Task by ID or Keyword"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 3 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Error */}
      {error && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography color="error">{error}</Typography>
            <Button size="small" onClick={() => loadTasks(true)}>Retry</Button>
          </Stack>
        </Paper>
      )}

      {/* Loading */}
      {loading && (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>Loading tasks...</Typography>
        </Stack>
      )}

      {/* Empty state */}
      {!loading && !error && filteredTasks.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#fffde7', border: '1px solid #ffeb3b' }}>
          <Typography variant="body1" color="text.secondary">No tasks found.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Click "Create New Task" above to add your first task!
          </Typography>
        </Paper>
      )}

      {/* Tasks grid */}
      {!loading && !error && filteredTasks.length > 0 && (
        <Grid container spacing={isMobile ? 1.5 : 2.5}>
          {filteredTasks.map((task, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={task.task_id || idx}>
              <TaskCard
                task={task}
                onEdit={handleEdit}
                onAction={handleNextAction}
                onDelete={(t) => deleteConfirm.openConfirm(t)}
                getAssigneeName={getUsername}
                compact={isMobile}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={formDialog.open}
        onClose={formDialog.closeDialog}
        form={form}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
        userOptions={userOptions}
        selfUser={selfUser}
        error={formError}
        onDelete={() => deleteConfirm.openConfirm(form)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.confirmOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete the task "${deleteConfirm.itemToConfirm?.title}"?`}
        onConfirm={() => handleDelete(deleteConfirm.itemToConfirm)}
        onCancel={deleteConfirm.closeConfirm}
        confirmText="Delete"
        confirmColor="error"
      />
    </Paper>
  );
}
