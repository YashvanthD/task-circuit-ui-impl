import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, MenuItem, Stack } from '@mui/material';
import { addUser } from '../utils/user';

/**
 * AddUserForm - Form to add a new user
 * Fields: username, password, mobile, email, permissions (role), actions
 */
const roleOptions = ['user', 'admin', 'manager'];
const actionOptions = ['view', 'edit', 'delete', 'create'];

export default function AddUserForm() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    mobile: '',
    email: '',
    permissions: '',
    actions: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleActionsChange = (e) => {
    const { value } = e.target;
    setForm(f => ({ ...f, actions: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.username || !form.password || !form.mobile || !form.email || !form.permissions) {
      setError('All required fields must be filled');
      return;
    }
    try {
      await addUser(form);
      setSuccess('User added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to add user');
    }
  };

  return (
    <Paper elevation={3} sx={{padding:4, maxWidth:500, margin:'80px auto'}}>
      <Typography variant="h6" gutterBottom>Add User</Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField label="Username" name="username" variant="outlined" fullWidth margin="normal" value={form.username} onChange={handleChange} required />
        <TextField label="Password" name="password" type="password" variant="outlined" fullWidth margin="normal" value={form.password} onChange={handleChange} required />
        <TextField label="Mobile" name="mobile" type="tel" variant="outlined" fullWidth margin="normal" value={form.mobile} onChange={handleChange} required />
        <TextField label="Email" name="email" type="email" variant="outlined" fullWidth margin="normal" value={form.email} onChange={handleChange} required />
        <TextField select label="Permissions (Role)" name="permissions" variant="outlined" fullWidth margin="normal" value={form.permissions} onChange={handleChange} required>
          {roleOptions.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
        </TextField>
        <TextField select label="Actions" name="actions" variant="outlined" fullWidth margin="normal" value={form.actions} onChange={handleActionsChange} SelectProps={{ multiple: true }}>
          {actionOptions.map(action => <MenuItem key={action} value={action}>{action}</MenuItem>)}
        </TextField>
        {error && <Typography color="error" mt={2}>{error}</Typography>}
        {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        <Button variant="contained" color="primary" fullWidth sx={{mt:2}} type="submit">Add User</Button>
      </Box>
    </Paper>
  );
}
