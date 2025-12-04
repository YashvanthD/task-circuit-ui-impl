import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Button, Grid, Card, CardContent, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, loadTasksFromLocalStorage, saveTasksToLocalStorage, getTasksLastFetched } from '../../utils/storage';
import { BASE_URL } from '../../config';
import { apiFetch } from '../../utils/api';

/**
 * Dashboard page for logged-in users in Task Circuit.
 * Displays user info and a welcome message.
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [remindDropdown, setRemindDropdown] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      navigate('/taskcircuit/login');
      return;
    }
    const localTasks = loadTasksFromLocalStorage();
    const lastFetched = getTasksLastFetched();
    const now = Date.now();
    // Use cached tasks if fetched within last 5 minutes
    if (localTasks && lastFetched && (now - lastFetched < 5 * 60 * 1000)) {
      setTasks(localTasks);
      setLoading(false);
      return;
    }
    async function fetchTasks() {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`${BASE_URL}/task/`, { method: 'GET' });
        const data = await res.json();
        if (res.ok && data.success) {
          setTasks(data.tasks || []);
          saveTasksToLocalStorage(data.tasks || []);
        } else {
          setError(data.error || 'Failed to fetch tasks');
        }
      } catch (err) {
        setError('Network/server error');
      }
      setLoading(false);
    }
    fetchTasks();
  }, [navigate]);

  // Compute stats and alerts from tasks
  const now = new Date('2025-12-01T00:00:00');
  const activeTasks = tasks.filter(t => t.status !== 'completed').length;
  const criticalTasks = tasks.filter(t => t.priority === 1 || (t.end_date && new Date(t.end_date.replace(' ', 'T')) < now && t.status !== 'completed')).length;
  const alerts = tasks.filter(t => t.priority <= 3 && t.status !== 'completed').slice(0, 5).map((t, idx) => ({
    title: t.title,
    description: t.description,
    completeBy: t.end_date ? Math.floor(new Date(t.end_date.replace(' ', 'T')).getTime() / 1000) : null,
    unread: t.unread !== false,
    priority: t.priority,
    idx,
    task_id: t.task_id
  }));

  function formatTime(ts) {
    const date = new Date(ts * 1000);
    return date.toLocaleString();
  }

  const actions = [
    { label: 'Water Test', to: '/taskcircuit/user/water-test' },
    { label: 'Sampling', to: '/taskcircuit/user/sampling' },
    { label: 'Transform', to: '/taskcircuit/user/transform' },
    { label: 'New Task', to: '/taskcircuit/user/tasks/new' },
    { label: 'Reports', to: '/taskcircuit/user/reports' }
  ];

  function getPriorityStyle(priority) {
    switch (priority) {
      case 1:
        return { border: '1.5px solid #f44336', boxShadow: '0 0 4px #f44336' };
      case 2:
        return { border: '1.5px solid #ff7961', boxShadow: '0 0 4px #ff7961' };
      case 3:
        return { border: '1.5px solid #ff9800', boxShadow: '0 0 4px #ff9800' };
      case 4:
        return { border: '1.5px solid #ffeb3b', boxShadow: '0 0 4px #ffeb3b' };
      case 5:
        return { border: '1.5px solid #4caf50', boxShadow: '0 0 4px #4caf50' };
      default:
        return { border: '1px solid #e0e0e0' };
    }
  }

  // Dialog handlers
  const handleAlertClick = (alert, idx) => {
    setSelectedAlert({ ...alert, idx });
    setDialogOpen(true);
    setRemindDropdown('');
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAlert(null);
    setRemindDropdown('');
  };
  const updateTasks = (newTasks) => {
    setTasks(newTasks);
    saveTasksToLocalStorage(newTasks);
  };
  /**
   * Update a task by ID with given changes, sync with API and localStorage.
   * @param {string} taskId
   * @param {object} changes
   */
  const updateTask = async (taskId, changes) => {
    const accessToken = getAccessToken();
    try {
      const res = await apiFetch(`${BASE_URL}/task/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(changes)
      });
      if (res.ok) {
        // Update local state and localStorage
        const newTasks = tasks.map(t => t.task_id === taskId ? { ...t, ...changes } : t);
        setTasks(newTasks);
        saveTasksToLocalStorage(newTasks);
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Update usages in handlers
  const handleMarkAsDone = async () => {
    if (selectedAlert) {
      await updateTask(selectedAlert.task_id, { status: 'completed' });
      setDialogOpen(false);
      setSelectedAlert(null);
      setRemindDropdown('');
    }
  };
  const handleRemindMeLater = () => {
    if (selectedAlert && remindDropdown) {
      // This is a UI-only change for now
      setDialogOpen(false);
      setSelectedAlert(null);
      setRemindDropdown('');
    }
  };
  const handleMarkAsUnread = async () => {
    if (selectedAlert) {
      await updateTask(selectedAlert.task_id, { unread: true });
      setDialogOpen(false);
      setSelectedAlert(null);
      setRemindDropdown('');
    }
  };

  // Top summary: total critical actions and alerts in red alert note
  const showCriticalSummary = criticalTasks > 0 || alerts.length > 0;
  const renderCriticalSummary = showCriticalSummary ? (
    <Paper elevation={2} sx={{ mb: 4, p: 2, backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
      <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
        Critical: {criticalTasks} actions & {alerts.length} alerts
      </Typography>
      <Typography variant="body2" color="error">
        Immediate attention required for critical actions and alerts.
      </Typography>
    </Paper>
  ) : null;

  // Section 1: Task stats
  const renderTaskStats = activeTasks === 0 && criticalTasks === 0 ? (
    <Paper elevation={2} sx={{ mb: 4, p: 2 }}>
      <Typography variant="body2" color="text.secondary">No tasks available.</Typography>
    </Paper>
  ) : (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6}>
        <Card sx={{ p: 2, m: 2 }}>
          <CardContent>
            <Typography variant="h6">Active Tasks</Typography>
            <Typography variant="h3" color="primary">{activeTasks}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card sx={{ p: 2, m: 2 }}>
          <CardContent>
            <Typography variant="h6">Critical Tasks</Typography>
            <Typography variant="h3" color="error">{criticalTasks}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Section 2: Top 5 Alerts
  const renderAlerts = (
    <Paper elevation={2} sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Top 5 Alerts</Typography>
      {loading ? (
        <Stack alignItems="center" sx={{mt:2, mb:2}}>
          <CircularProgress />
          <Typography variant="body2" sx={{mt:2}}>Loading alerts...</Typography>
        </Stack>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : alerts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No alerts to show.</Typography>
      ) : (
        <Grid container spacing={2}>
          {alerts.map((alert, idx) => (
            <Grid item xs={12} sm={6} md={4} key={alert.task_id || idx}>
              <Card sx={{ cursor: 'pointer', ...getPriorityStyle(alert.priority), p: 2, m: 2 }} onClick={() => handleAlertClick(alert, idx)}>
                <CardContent>
                  <Typography variant="body1" sx={{ fontWeight: alert.unread ? 'bold' : 'normal', color: alert.unread ? 'error.main' : 'inherit' }}>
                    {alert.title} <span style={{float:'right', fontWeight:'bold', color:'#888'}}>#{alert.priority}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{alert.description}</Typography>
                  <Typography variant="caption" color="text.secondary">Complete by: {alert.completeBy ? formatTime(alert.completeBy) : 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/taskcircuit/user/tasks')}>See More</Button>
      </Stack>
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAlert?.title} <span style={{float:'right', fontWeight:'bold', color:'#888'}}>#{selectedAlert?.priority}</span>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>{selectedAlert?.description}</Typography>
          <Typography variant="caption" color="text.secondary">Complete by: {selectedAlert ? formatTime(selectedAlert.completeBy) : ''}</Typography>
          {!selectedAlert?.unread && (
            <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>This alert is read.</Typography>
          )}
          {selectedAlert?.unread && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>This alert is unread.</Typography>
          )}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="remind-label">Remind Me Later</InputLabel>
            <Select
              labelId="remind-label"
              value={remindDropdown}
              label="Remind Me Later"
              onChange={e => setRemindDropdown(e.target.value)}
              variant="outlined"
            >
              <MenuItem value="5min">5 min</MenuItem>
              <MenuItem value="30min">30 min</MenuItem>
              <MenuItem value="1hour">1 hour</MenuItem>
              <MenuItem value="custom">Custom (2 hours)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMarkAsDone} color="primary">Mark as Done</Button>
          <Button onClick={handleRemindMeLater} color="info" disabled={!remindDropdown}>Remind Me Later</Button>
          <Button onClick={handleMarkAsUnread} color="warning">Mark as Unread</Button>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );

  // Section 3: Actions
  const renderActions = (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Actions</Typography>
      <Grid container spacing={2}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.label}>
            <Card sx={{ cursor: 'pointer', p: 2, m: 2 }} onClick={() => { navigate(action.to); }}>
              <CardContent>
                <Typography variant="body1">{action.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );

  console.log('[Dashboard Debug] activeTasks:', activeTasks, 'criticalTasks:', criticalTasks);
  console.log('[Dashboard Debug] alerts:', alerts);

  return (
    <>
      {renderCriticalSummary}
      {renderTaskStats}
      {renderAlerts}
      {renderActions}
    </>
  );
}
