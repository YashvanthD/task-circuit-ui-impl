import React, { useState } from 'react';
import { Alert, Grid } from '@mui/material';
import { registerCompany } from '../../../api';
import { FormContainer, FormSection, FormField, FormActions } from './index';

/**
 * RegisterCompanyForm - Company registration form for TaskCircuit
 */
export default function RegisterCompanyForm({ onSuccess, onCancel }) {
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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

    setLoading(true);
    try {
      const res = await registerCompany(form);
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Company registration successful!');
        if (onSuccess) onSuccess(data);
      } else {
        setError(data.error || (data.errors && Object.values(data.errors).join(', ')) || 'Registration failed');
      }
    } catch (err) {
      setError('Network/server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      title="Register Company"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      maxWidth={500}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={2}>
        <FormSection title="Organization" subtitle="Company details">
          <FormField
            label="Company Name"
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            required
            xs={12}
          />
          <FormField
            label="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            xs={12}
          />
          <FormField
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            xs={6}
          />
          <FormField
            label="Master Password"
            name="master_password"
            type="password"
            value={form.master_password}
            onChange={handleChange}
            required
            helperText="Required for platform registration"
            xs={6}
          />
        </FormSection>

        <FormSection title="Admin User" subtitle="Create the first admin account">
          <FormField
            label="Admin Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            xs={12}
          />
          <FormField
            label="Admin Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            xs={12}
          />
          <FormField
            label="Admin Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            xs={12}
          />
        </FormSection>

        <FormActions
          submitText="Register Company"
          loading={loading}
          onCancel={onCancel}
        />
      </Grid>
    </FormContainer>
  );
}
