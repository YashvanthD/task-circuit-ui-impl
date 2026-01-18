import React, { useState } from 'react';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { updateUserEmail } from '../../../utils/user';

/**
 * UpdateMailForm - Form to update user email
 * @param {function} onSuccess - Callback when email is updated successfully
 * @param {function} onClose - Callback to close the form/dialog
 */
export default function UpdateMailForm({ onSuccess, onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await updateUserEmail(email);
      console.log('[UpdateMailForm] Update result:', result);
      setSuccess('Email updated successfully!');
      setLoading(false);

      // Close dialog and trigger refresh
      setTimeout(() => {
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      console.error('[UpdateMailForm] Update failed:', err);
      setError(err.message || 'Failed to update email');
      setLoading(false);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      <TextField
        label="New Email Address"
        type="email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        placeholder="user@example.com"
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
        {loading ? <CircularProgress size={24} /> : 'Update Email'}
      </Button>
    </Box>
  );
}
