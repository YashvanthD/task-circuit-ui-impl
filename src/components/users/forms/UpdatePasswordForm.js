import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import { updateUserPassword } from '../../../utils/user';

/**
 * UpdatePasswordForm - Form to update user password
 * Fields: old_password, new_password, confirm_password
 */
export default function UpdatePasswordForm() {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.old_password || !form.new_password || !form.confirm_password) {
      setError('All fields are required');
      return;
    }
    if (form.new_password !== form.confirm_password) {
      setError('New password and confirm password do not match');
      return;
    }
    try {
      await updateUserPassword(form.old_password, form.new_password);
      setSuccess('Password updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    }
  };

  return (
    <Paper elevation={3} sx={{padding:4, maxWidth:400, margin:'80px auto'}}>
      <Typography variant="h6" gutterBottom>Update Password</Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField label="Old Password" name="old_password" type="password" variant="outlined" fullWidth margin="normal" value={form.old_password} onChange={handleChange} required />
        <TextField label="New Password" name="new_password" type="password" variant="outlined" fullWidth margin="normal" value={form.new_password} onChange={handleChange} required />
        <TextField label="Confirm Password" name="confirm_password" type="password" variant="outlined" fullWidth margin="normal" value={form.confirm_password} onChange={handleChange} required />
        {error && <Typography color="error" mt={2}>{error}</Typography>}
        {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        <Button variant="contained" color="primary" fullWidth sx={{mt:2}} type="submit">Update Password</Button>
      </Box>
    </Paper>
  );
}
