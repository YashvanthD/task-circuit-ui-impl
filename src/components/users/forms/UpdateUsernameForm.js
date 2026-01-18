import React, { useState } from 'react';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { updateUsername } from '../../../utils/user';

/**
 * UpdateUsernameForm - Form to update user username
 * @param {function} onSuccess - Callback when username is updated successfully
 * @param {function} onClose - Callback to close the form/dialog
 */
export default function UpdateUsernameForm({ onSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    // Basic username validation (alphanumeric and underscore)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await updateUsername(username);
      console.log('[UpdateUsernameForm] Update result:', result);
      setSuccess('Username updated successfully!');
      setLoading(false);

      // Close dialog and trigger refresh
      setTimeout(() => {
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      console.error('[UpdateUsernameForm] Update failed:', err);
      setError(err.message || 'Failed to update username');
      setLoading(false);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      <TextField
        label="New Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        disabled={loading}
        helperText="At least 3 characters, letters, numbers, and underscores only"
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
        {loading ? <CircularProgress size={24} /> : 'Update Username'}
      </Button>
    </Box>
  );
}
