import React, { useEffect, useState, useCallback } from 'react';
import {
  Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, InputLabel, FormControl, Stack, Chip, Grid, InputAdornment, IconButton,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { apiFetch } from '../../utils/api/client';
import { getUserInfo, listAccountUsers } from '../../utils/user';
import { fetchAllTasks, saveTask, deleteTask, saveTasks, getTasks, updateTask } from '../../utils/tasks';
import { getPriorityColor, getPriorityLabel, getPriorityStyle, getNextActionColor } from '../../utils/helpers/common';
import { getDefaultEndDate, getTimeLeft } from '../../utils/helpers/date';

const initialForm = {
  title: '',
  description: '',
  status: 'pending',
  priority: '3',
  assigned_to: '',
  end_date: getDefaultEndDate(),
  task_date: '',
  notes: '',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [userOptions, setUserOptions] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const rawUserInfo = getUserInfo();
  const selfUserKey = rawUserInfo?.userKey || rawUserInfo?.user_key || '';
  const selfUserName = rawUserInfo?.user?.username || rawUserInfo?.username || 'Self (You)';
  const selfUser = selfUserKey ? { user_key: String(selfUserKey), username: selfUserName } : null;

  const fetchTasks = useCallback(async (forceApiCall = false) => {
    setLoading(true);
    setError('');
    console.log('[TasksPage Debug] fetchTasks called, forceApiCall:', forceApiCall);
    try {
      const tasks = forceApiCall ? await fetchAllTasks() : await getTasks();
      setTasks(tasks || []);
      if (tasks) await saveTasks(tasks);
      console.log('[TasksPage Debug] Tasks set:', tasks);
    } catch (err) {
      setError(err.message);
      console.log('[TasksPage Debug] Error:', err.message);
    }
    setLoading(false);
    console.log('[TasksPage Debug] Loading set to false');
    console.log('[TasksPage Debug] Current tasks state:', tasks);
    console.log('[TasksPage Debug] Current error state:', error);
  }, []);

  useEffect(() => {
    console.log('[TasksPage Debug] useEffect triggered, refresh:', refresh);
    fetchTasks(refresh); // when refresh toggles true, force API; otherwise use cache
  }, [refresh, fetchTasks]);

  useEffect(() => {
    async function loadUsers() {
      if (!dialogOpen || usersLoaded) return;
      try {
        const users = await listAccountUsers();
        const normalized = users.map(u => ({
          ...u,
          user_key: String(u.user_key || u.userKey),
        }));
        const options = selfUser
          ? [selfUser, ...normalized.filter(u => u.user_key !== selfUser.user_key)]
          : normalized;
        setUserOptions(options);
        setUsersLoaded(true);
      } catch (err) {
        console.log('[TasksPage Debug] Failed to load account users:', err.message);
      }
    }
    loadUsers();
  }, [dialogOpen, selfUser, usersLoaded]);

  const meta = tasks.reduce((acc, t) => {
    if (t.status === 'completed') acc.completed++;
    else if (t.status === 'inprogress') acc.inprogress++;
    else acc.pending++;
    acc.total++;
    return acc;
  }, { completed: 0, inprogress: 0, pending: 0, total: 0 });

  const filteredTasks = tasks.filter(t => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      (t.task_id && t.task_id.includes(searchTerm)) ||
      (t.title && t.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    if (t.status === 'completed' && t.end_date) {
      const now = new Date();
      let end = new Date(t.end_date.replace(' ', 'T'));
      if ((now - end) > 3600000 && !searchTerm && filterStatus !== 'completed') return false;
    }
    return matchesStatus && matchesSearch;
  })
  .sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    return 0;
  });

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setFormError('');
    let submitForm = { ...form };
    if (!submitForm.assigned_to && selfUser) {
      submitForm.assigned_to = selfUser.user_key;
    }
    if (!submitForm.title || !submitForm.assigned_to || !submitForm.end_date) {
      setFormError('Fields marked * are required');
      return;
    }
    submitForm.priority = parseInt(submitForm.priority, 10) || 3;
    const isEdit = !!submitForm.task_id;
    delete submitForm._id;
    console.log('[TasksPage Debug] handleFormSubmit called, form:', submitForm);
    saveTask(submitForm, isEdit)
      .then(() => {
        setDialogOpen(false);
        setForm(initialForm);
        setRefresh(r => !r);
        fetchTasks();
      })
      .catch((err) => {
        setFormError(err.message);
        console.log('[TasksPage Debug] Form error:', err.message);
      });
  }

  // Helper to safely resolve a task's ID from multiple possible fields
  function resolveTaskId(task) {
    if (!task) return undefined;
    const rawId = task.taskId || task.task_id || task.id || task._id;
    return rawId != null ? String(rawId) : undefined;
  }

  function handleEdit(task) {
    const taskId = resolveTaskId(task);
    setForm({
      ...task,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority || 3,
      assigned_to: task.assigned_to,
      end_date: task.end_date || getDefaultEndDate(),
      task_date: task.task_date || '',
      notes: task.notes || '',
      task_id: taskId,
    });
    setDialogOpen(true);
  }

  function getUsername(userKey) {
    const user = userOptions.find(u => u.user_key === userKey);
    return user ? user.username : userKey;
  }

  function getNextAction(status) {
    switch (status) {
      case 'pending':
        return 'Start';
      case 'inprogress':
        return 'Resolve';
      case 'completed':
        return 'Resolved';
      default:
        return 'Next';
    }
  }

  function getNextActionVariant(status) {
    // All primary actions are contained for now; this is here for future style tweaks per status
    return 'contained';
  }

  function handleNextAction(task) {
    let nextStatus = task.status;
    if (task.status === 'pending') {
      nextStatus = 'inprogress';
    } else if (task.status === 'inprogress') {
      nextStatus = 'completed';
    } else {
      // completed/resolved state: no further action
      return;
    }

    const id = resolveTaskId(task);
    if (!id) {
      console.log('[TasksPage Debug] handleNextAction missing task id', task);
      return;
    }

    updateTask(id, { status: nextStatus })
      .then(() => setRefresh((r) => !r))
      .catch((err) => {
        console.log('[TasksPage Debug] handleNextAction error:', err?.message || err);
      });
  }

  async function handleConfirmDelete() {
    if (!taskToDelete) return;
    const id = resolveTaskId(taskToDelete);
    if (!id) {
      console.log('[TasksPage Debug] handleConfirmDelete missing task id', taskToDelete);
      return;
    }
    try {
      await deleteTask(id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      setRefresh(r => !r);
    } catch (err) {
      console.log('[TasksPage Debug] Delete error:', err.message);
    }
  }

  function handleCancelDelete() {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  }

  return (
    <Paper sx={{ padding: 4, maxWidth: 1280, margin: '40px auto' }}>
      {/* Top bar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mb:3}}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip label={`Total: ${meta.total}`} color="primary" />
          <Chip label={`Completed: ${meta.completed}`} color="success" />
          <Chip label={`In Progress: ${meta.inprogress}`} color="info" />
          <Chip label={`Pending: ${meta.pending}`} color="default" />
          <FormControl size="small" sx={{minWidth:120}}>
            <InputLabel id="filter-status-label">Status</InputLabel>
            <Select
              labelId="filter-status-label"
              value={filterStatus}
              label="Status"
              onChange={e => setFilterStatus(e.target.value)}
              variant="outlined"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="inprogress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setForm({
              ...initialForm,
              assigned_to: selfUser ? selfUser.user_key : '',
            });
            setDialogOpen(true);
          }}
        >
          Create New Task
        </Button>
      </Stack>
      {/* Search box */}
      <TextField
        label="Search Task by ID or Keyword"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        fullWidth
        size="small"
        sx={{mb:3}}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />
      {/* Error */}
      {error && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography color="error" variant="h6">Error: {error}</Typography>
        </Paper>
      )}
      {/* Tasks list or empty state */}
      {!loading && !error && filteredTasks.length === 0 && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fffde7', border: '1px solid #ffeb3b', textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">No tasks found.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{mt:2}}>
            You have no tasks yet. Click "Create New Task" above to add your first task!
          </Typography>
        </Paper>
      )}
      {/* Tasks list */}
      {loading ? (
        <Stack alignItems="center" sx={{ mt: 4, mb: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>Loading tasks...</Typography>
        </Stack>
      ) : (!error && filteredTasks.length > 0) ? (
        <Grid container spacing={2.5}>
          {filteredTasks.map((task, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={4}
              xl={4}
              key={task.task_id || idx}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.06)',
                  ...getPriorityStyle(task.priority, task.status),
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                  boxSizing: 'border-box',
                }}
              >
                {/* Header: title + priority + edit */}
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, flex: 1, minWidth: 0 }}
                    noWrap
                  >
                    {task.title}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Chip
                      label={getPriorityLabel(task.priority)}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                    <IconButton size="small" onClick={() => handleEdit(task)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>

                {/* Optional description */}
                {task.description && (
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary' }}
                    noWrap
                  >
                    {task.description}
                  </Typography>
                )}

                {/* Meta info */}
                <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    <strong>End:</strong> {task.end_date}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    <strong>Time Left:</strong> {getTimeLeft(task.end_date)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    <strong>Assigned:</strong> {getUsername(task.assigned_to)}
                  </Typography>
                </Stack>

                {/* Footer: actions + id */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mt: 'auto', pt: 1 }}
                  spacing={1}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant={getNextActionVariant(task.status)}
                      size="small"
                      color={task.status === 'completed' ? 'success' : (task.status === 'inprogress' ? 'warning' : getNextActionColor(task.status))}
                      sx={task.status === 'inprogress'
                        ? { backgroundColor: 'orange', color: 'white', '&:hover': { backgroundColor: '#ff9800' } }
                        : (task.status === 'completed'
                          ? { backgroundColor: '#4caf50', color: 'white', opacity: 1, pointerEvents: 'none' }
                          : {})}
                      onClick={() => handleNextAction(task)}
                      disabled={task.status === 'completed'}
                    >
                      {getNextAction(task.status)}
                    </Button>
                    {task.status === 'completed' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => { setTaskToDelete(task); setDeleteDialogOpen(true); }}
                      >
                        Delete
                      </Button>
                    )}
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.disabled', textAlign: 'right' }}
                    noWrap
                  >
                    {task.task_id}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : null}

      {/* Create/Edit Task Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{form.task_id ? 'Edit Task' : 'Create Task'}</DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField label={<span>Title <span style={{color:'red'}}>*</span></span>} name="title" value={form.title} onChange={handleFormChange} required fullWidth />
              <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} multiline rows={2} fullWidth />
              <FormControl fullWidth>
                <InputLabel id="task-status-label">Status</InputLabel>
                <Select
                  labelId="task-status-label"
                  name="status"
                  value={form.status}
                  label="Status"
                  onChange={handleFormChange}
                  variant="outlined"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inprogress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="task-priority-label">Priority</InputLabel>
                <Select
                  labelId="task-priority-label"
                  name="priority"
                  value={form.priority}
                  label="Priority"
                  onChange={handleFormChange}
                  variant="outlined"
                >
                  <MenuItem value="1">1</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                  <MenuItem value="3">3</MenuItem>
                  <MenuItem value="4">4</MenuItem>
                  <MenuItem value="5">5</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="task-assigned-label">Assigned To *</InputLabel>
                <Select
                  labelId="task-assigned-label"
                  name="assigned_to"
                  value={form.assigned_to}
                  label="Assigned To *"
                  onChange={handleFormChange}
                  variant="outlined"
                  required
                >
                  {userOptions.map(u => (
                    <MenuItem key={u.user_key} value={u.user_key}>
                      {u.username || u.user_key}{selfUser && u.user_key === selfUser.user_key ? ' (You)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label={<span>End Date (YYYY-MM-DD) <span style={{color:'red'}}>*</span></span>} name="end_date" value={form.end_date} onChange={handleFormChange} required fullWidth />
              <TextField label="Task Date (YYYY-MM-DD)" name="task_date" value={form.task_date} onChange={handleFormChange} fullWidth />
              <TextField label="Notes" name="notes" value={form.notes} onChange={handleFormChange} multiline rows={2} fullWidth />
              {formError && <Typography color="error">{formError}</Typography>}
            </Stack>
          </DialogContent>
          <DialogActions>
            {form.task_id && (
              <Button
                onClick={() => {
                  setTaskToDelete(form);
                  setDeleteDialogOpen(true);
                }}
                variant="contained"
                color="error"
                sx={{ mr: 'auto' }}
              >
                Delete
              </Button>
            )}
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {form.task_id ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the task "{taskToDelete?.title}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
