import React, { useState } from 'react';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { updateUserPassword } from '../../../utils/user';

/**
 * UpdatePasswordForm - Form to update user password
 * Fields: old_password, new_password, confirm_password
 * @param {function} onSuccess - Callback when password is updated successfully
 * @param {function} onClose - Callback to close the form/dialog
 */
export default function UpdatePasswordForm({ onSuccess, onClose }) {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (form.new_password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await updateUserPassword({
        current_password: form.old_password,
        new_password: form.new_password,
      });
      setSuccess('Password updated successfully!');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
      setLoading(false);

      // Close dialog after short delay
      setTimeout(() => {
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      console.error('[UpdatePasswordForm] Update failed:', err);
      setError(err.message || 'Failed to update password');
      setLoading(false);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      <TextField
        label="Current Password"
        name="old_password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={form.old_password}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <TextField
        label="New Password"
        name="new_password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={form.new_password}
        onChange={handleChange}
        required
        disabled={loading}
        helperText="At least 6 characters"
      />
      <TextField
        label="Confirm New Password"
        name="confirm_password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={form.confirm_password}
        onChange={handleChange}
        required
        disabled={loading}
      />
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      {success && <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        type="submit"
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Update Password'}
      </Button>
    </Box>
  );
}
