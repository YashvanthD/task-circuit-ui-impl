import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, InputLabel, FormControl, Stack, Chip, Grid, Box,
  CircularProgress, InputAdornment, useMediaQuery, useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Hooks
import { useDialog, useConfirmDialog } from '../../hooks';

// Common components
import { ConfirmDialog } from '../../components';
import TaskCard from '../../components/TaskCard';

// Utils
import { getUserInfo } from '../../utils/user';
import { fetchAllTasks, saveTask, deleteTask, saveTasks, getTasks, updateTask } from '../../utils/tasks';
import { getDefaultEndDate } from '../../utils';
import { getUsersSync, getUsers } from '../../utils/cache/usersCache';

// ============================================================================
// Constants
// ============================================================================

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'pending',
  priority: '3',
  assigned_to: '', // Empty = Unassigned
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
              <InputLabel>Assigned To</InputLabel>
              <Select name="assigned_to" value={form.assigned_to} label="Assigned To" onChange={onChange}>
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {userOptions.map(u => (
                  <MenuItem key={u.user_key} value={u.user_key}>
                    {u.display_name || u.name || u.username || u.user_key}
                    {selfUser?.user_key === u.user_key ? ' (You)' : ''}
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
  const [form, setForm] = useState({ ...INITIAL_FORM }); // Start with Unassigned
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

  // Load users from cache on mount and when dialog opens
  useEffect(() => {
    // Always ensure users cache is populated
    getUsers().then(users => {
      const normalized = (users || []).map(u => ({
        ...u,
        user_key: String(u.user_key || u.userKey || u.id),
        display_name: u.display_name || u.name || u.username || u.email,
      }));
      const options = selfUser
        ? [selfUser, ...normalized.filter(u => u.user_key !== selfUser.user_key)]
        : normalized;
      setUserOptions(options);
    }).catch(err => {
      console.error('[TasksPage] Load users error:', err);
      // Fallback to already cached users
      const cachedUsers = getUsersSync() || [];
      const normalized = cachedUsers.map(u => ({
        ...u,
        user_key: String(u.user_key || u.userKey || u.id),
        display_name: u.display_name || u.name || u.username || u.email,
      }));
      const options = selfUser
        ? [selfUser, ...normalized.filter(u => u.user_key !== selfUser.user_key)]
        : normalized;
      setUserOptions(options);
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
    // Normalize task fields from different BE formats
    const assignedTo = task.assigned_to || task.assignedTo || task.assignee || task.userKey || '';
    const endDate = task.end_date || task.endDate || task.endTime || getDefaultEndDate();
    const taskDate = task.task_date || task.taskDate || task.scheduledDate || '';

    setForm({
      ...task,
      assigned_to: assignedTo,
      priority: String(task.priority || 3),
      end_date: endDate ? endDate.split('T')[0] : getDefaultEndDate(), // Extract date part
      task_date: taskDate ? taskDate.split('T')[0] : '', // Extract date part
      notes: task.notes || '',
      task_id: resolveTaskId(task),
    });
    setFormError('');
    formDialog.openDialog(task);
  };

  const handleCreate = () => {
    setForm({ ...INITIAL_FORM }); // Use initial form with empty assigned_to (Unassigned)
    setFormError('');
    formDialog.openDialog();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const submitData = { ...form };
    // assigned_to is optional now - don't auto-assign
    if (!submitData.title || !submitData.end_date) {
      setFormError('Title and End Date are required');
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

  const getUsername = useCallback((userKey) => {
    if (!userKey) return 'Unassigned';

    // First check the userOptions (already loaded)
    const fromOptions = userOptions.find(u =>
      String(u.user_key) === String(userKey) ||
      String(u.userKey) === String(userKey)
    );
    if (fromOptions) {
      return fromOptions.display_name || fromOptions.name || fromOptions.username || userKey;
    }

    // Fallback to cached users
    const cachedUsers = getUsersSync() || [];
    const fromCache = cachedUsers.find(u =>
      String(u.user_key) === String(userKey) ||
      String(u.userKey) === String(userKey) ||
      String(u.id) === String(userKey)
    );
    if (fromCache) {
      return fromCache.display_name || fromCache.name || fromCache.username || userKey;
    }

    return userKey; // Return key if no user found
  }, [userOptions]);

  return (
    <Paper sx={{ padding: { xs: 2, sm: 3, md: 4 }, maxWidth: 1280, margin: { xs: '16px auto', sm: '24px auto', md: '40px auto' } }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track your tasks
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          sx={{ borderRadius: 2, alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          + Create Task
        </Button>
      </Stack>

      {/* Stats Row - Scrollable on mobile */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 2,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
        }}
      >
        <Chip
          label={`Total: ${stats.total}`}
          color="primary"
          size="small"
          sx={{ flexShrink: 0 }}
        />
        <Chip
          label={`✅ ${stats.completed}`}
          color="success"
          size="small"
          sx={{ flexShrink: 0 }}
        />
        <Chip
          label={`🔄 ${stats.inprogress}`}
          color="info"
          size="small"
          sx={{ flexShrink: 0 }}
        />
        <Chip
          label={`⏳ ${stats.pending}`}
          color="default"
          size="small"
          sx={{ flexShrink: 0 }}
        />
      </Box>

      {/* Filters Row - Stack on mobile */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        {/* Search */}
        <TextField
          label="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flex: { xs: 'auto', sm: 1 }, maxWidth: { sm: 400 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Status Filter */}
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
          <InputLabel>Filter Status</InputLabel>
          <Select
            value={filterStatus}
            label="Filter Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All Tasks</MenuItem>
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Error */}
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', border: '1px solid', borderColor: 'error.main' }}>
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
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.main' }}>
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
