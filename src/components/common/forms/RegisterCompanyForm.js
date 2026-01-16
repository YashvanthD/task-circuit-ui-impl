import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import { apiFetch } from '../../../utils/api';
import { REGISTER_COMPANY_ENDPOINT } from '../../../endpoints';

/**
 * RegisterCompanyForm - Company registration form for TaskCircuit
 * Fields: master_password, company_name, username, password, email, pincode, description
 * Handles API call and error/success display.
 */
export default function RegisterCompanyForm() {
  const [form, setForm] = useState({
    master_password: '',
    company_name: 'TaskCircuit',
    username: '',
    password: '',
    email: '',
    pincode: '',
    description: 'Default company for TaskCircuit'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.company_name) {
      setError('Company name is required');
      return;
    }
    if (!form.master_password) {
      setError('Master password is required');
      return;
    }
    if (!form.username || !form.password || !form.email) {
      setError('Username, password, and email are required');
      return;
    }
    try {
      const submitBody = { ...form };
      const res = await apiFetch(REGISTER_COMPANY_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(submitBody),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Company registration successful!');
      } else {
        setError(data.error || (data.errors && Object.values(data.errors).join(', ')) || 'Registration failed');
      }
    } catch (err) {
      setError('Network/server error');
    }
  };

  return (
    <Paper elevation={3} sx={{padding:4, maxWidth:400, margin:'120px auto'}}>
      <Typography variant="h5" gutterBottom>Register Company</Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField label="Master Password" name="master_password" type="password" variant="outlined" fullWidth margin="normal" value={form.master_password} onChange={handleChange} required />
        <TextField label="Company Name" name="company_name" variant="outlined" fullWidth margin="normal" value={form.company_name} onChange={handleChange} required />
        <TextField label="Admin Username" name="username" variant="outlined" fullWidth margin="normal" value={form.username} onChange={handleChange} required />
        <TextField label="Admin Password" name="password" type="password" variant="outlined" fullWidth margin="normal" value={form.password} onChange={handleChange} required />
        <TextField label="Admin Email" name="email" type="email" variant="outlined" fullWidth margin="normal" value={form.email} onChange={handleChange} required />
        <TextField label="Pincode" name="pincode" variant="outlined" fullWidth margin="normal" value={form.pincode} onChange={handleChange} />
        <TextField label="Description" name="description" variant="outlined" fullWidth margin="normal" value={form.description} onChange={handleChange} />
        {error && <Typography color="error" mt={2}>{error}</Typography>}
        {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        <Button variant="contained" color="primary" fullWidth sx={{mt:2}} type="submit">Register Company</Button>
      </Box>
    </Paper>
  );
}
