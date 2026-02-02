import React, { useState } from 'react';
import { signup } from '../../../api';
import { FormContainer, FormSection, FormField, FormActions } from '../../common/forms';
import { Alert, Grid } from '@mui/material';

/**
 * SignupForm - User registration form for TaskCircuit
 * Includes username, email, password, company name, and master password fields.
 * Handles API call and error/success display.
 */
export default function SignupForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    company_name: 'TaskCircuit',
    master_password: ''
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

    setLoading(true);
    try {
      const res = await signup(form);
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Registration successful!');
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
      title="Create Account"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      maxWidth={500}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={2}>
        <FormSection title="User Credentials" subtitle="Enter your login details">
          <FormField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            xs={12}
          />
          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            xs={12}
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            xs={12}
          />
        </FormSection>

        <FormSection title="Organization Details" subtitle="Register your farm or company">
          <FormField
            label="Company Name"
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            required
            xs={12}
          />
          <FormField
            label="Master Password"
            name="master_password"
            type="password"
            value={form.master_password}
            onChange={handleChange}
            helperText="Used for sensitive administrative actions"
            xs={12}
          />
        </FormSection>

        <FormActions
          submitText="Create Account"
          loading={loading}
          onCancel={onCancel}
        />
      </Grid>
    </FormContainer>
  );
}
