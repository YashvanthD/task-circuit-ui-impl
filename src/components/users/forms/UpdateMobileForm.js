import React, { useState } from 'react';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { updateUserMobile } from '../../../utils/user';

/**
 * UpdateMobileForm - Form to update user mobile number
 * @param {function} onSuccess - Callback when mobile is updated successfully
 * @param {function} onClose - Callback to close the form/dialog
 */
export default function UpdateMobileForm({ onSuccess, onClose }) {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!mobile) {
      setError('Mobile number is required');
      return;
    }

    // Basic validation for phone number
    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!phoneRegex.test(mobile)) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await updateUserMobile(mobile);
      console.log('[UpdateMobileForm] Update result:', result);
      setSuccess('Mobile number updated successfully!');
      setLoading(false);

      // Close dialog and trigger refresh
      setTimeout(() => {
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      console.error('[UpdateMobileForm] Update failed:', err);
      setError(err.message || 'Failed to update mobile number');
      setLoading(false);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      <TextField
        label="New Mobile Number"
        type="tel"
        variant="outlined"
        fullWidth
        margin="normal"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        required
        disabled={loading}
        placeholder="+1 234 567 8900"
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
        {loading ? <CircularProgress size={24} /> : 'Update Mobile'}
      </Button>
    </Box>
  );
}
