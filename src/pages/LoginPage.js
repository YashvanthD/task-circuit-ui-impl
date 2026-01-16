import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { processLoginResponse } from '../utils/auth/storage';
import { login } from '../api';
import { BASE_APP_PATH_USER_DASHBOARD } from '../config';

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
      const response = await login({ username, password });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Invalid credentials.');
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (data.data && data.data.refreshToken && data.data.accessToken) {
        processLoginResponse(data);
        navigate(BASE_APP_PATH_USER_DASHBOARD, { replace: true });
      } else {
        setError('Login failed: No access or refresh token received.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
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
