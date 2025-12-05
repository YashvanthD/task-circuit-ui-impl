import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import { apiFetch } from '../utils/api';
import { UPDATE_MAIL_ENDPOINT } from '../endpoints';

/**
 * UpdateMailForm - Form to update user email
 * Fields: email, otp (optional)
 */
export default function UpdateMailForm() {
  const [form, setForm] = useState({ email: '', otp: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');
    if (!form.email) {
      setError('Email is required');
      return;
    }
    // Simulate OTP send (can be skipped)
    setOtpSent(true);
    setSuccess('OTP sent (simulated, can be skipped)');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.email) {
      setError('Email is required');
      return;
    }
    // OTP can be skipped
    try {
      const res = await apiFetch(UPDATE_MAIL_ENDPOINT, {
        method: 'PUT',
        body: JSON.stringify({ email: form.email, otp: form.otp }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Email updated successfully!');
      } else {
        setError(data.error || 'Failed to update email');
      }
    } catch (err) {
      setError('Network/server error');
    }
  };

  return (
    <Paper elevation={3} sx={{padding:4, maxWidth:400, margin:'80px auto'}}>
      <Typography variant="h6" gutterBottom>Update Email</Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField label="New Email" name="email" type="email" variant="outlined" fullWidth margin="normal" value={form.email} onChange={handleChange} required />
        {otpSent && (
          <TextField label="OTP (optional)" name="otp" type="text" variant="outlined" fullWidth margin="normal" value={form.otp} onChange={handleChange} />
        )}
        {error && <Typography color="error" mt={2}>{error}</Typography>}
        {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        <Button variant="outlined" color="info" fullWidth sx={{mt:2}} type="button" onClick={handleSendOtp}>Send OTP (optional)</Button>
        <Button variant="contained" color="primary" fullWidth sx={{mt:2}} type="submit">Update Email</Button>
      </Box>
    </Paper>
  );
}

