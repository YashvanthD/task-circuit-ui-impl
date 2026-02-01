import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { userSession } from '../utils/auth/userSession';
import { startAccessTokenManagement } from '../utils/auth/storage';
import { login } from '../api';
import { BASE_APP_PATH_USER_DASHBOARD } from '../config';
import { getNotifications } from '../utils/cache/notificationsCache';
import { getAlerts } from '../utils/cache/alertsCache';

/**
 * Login page component for Task Circuit.
 * @returns {JSX.Element}
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ username, password });

      // Initialize user session - throws error if tokens missing
      userSession.initFromLoginResponse(data);

      // Start token management
      startAccessTokenManagement();

      // Preload notifications and alerts in background
      getNotifications().catch(() => {});
      getAlerts().catch(() => {});

      navigate(BASE_APP_PATH_USER_DASHBOARD, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Paper elevation={6} sx={{ p: 4, minWidth: 320, maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>Login to Task Circuit</Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Username or Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, boxShadow: 2 }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
