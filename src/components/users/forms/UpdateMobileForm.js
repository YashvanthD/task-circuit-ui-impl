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
    try {
      await updateUserMobile(mobile);
      setSuccess('Mobile number updated successfully!');
      if (onSuccess) onSuccess();
      // Close dialog after short delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update mobile number');
    } finally {
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
