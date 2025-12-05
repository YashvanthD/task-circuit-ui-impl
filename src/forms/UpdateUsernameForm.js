import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import { apiFetch } from '../utils/api';
import { UPDATE_USERNAME_ENDPOINT } from '../endpoints';

/**
 * UpdateUsernameForm - Form to update user username
 * Fields: new_username
 */
export default function UpdateUsernameForm() {
  const [form, setForm] = useState({ new_username: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.new_username) {
      setError('Username is required');
      return;
    }
    try {
      const res = await apiFetch(UPDATE_USERNAME_ENDPOINT, {
        method: 'PUT',
        body: JSON.stringify({ username: form.new_username }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Username updated successfully!');
      } else {
        setError(data.error || 'Failed to update username');
      }
    } catch (err) {
      setError('Network/server error');
    }
  };

  return (
    <Paper elevation={3} sx={{padding:4, maxWidth:400, margin:'80px auto'}}>
      <Typography variant="h6" gutterBottom>Update Username</Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField label="New Username" name="new_username" variant="outlined" fullWidth margin="normal" value={form.new_username} onChange={handleChange} required />
        {error && <Typography color="error" mt={2}>{error}</Typography>}
        {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        <Button variant="contained" color="primary" fullWidth sx={{mt:2}} type="submit">Update Username</Button>
      </Box>
    </Paper>
  );
}

