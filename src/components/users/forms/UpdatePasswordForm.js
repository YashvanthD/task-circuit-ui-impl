import React, { useState } from 'react';
import { Alert, Grid } from '@mui/material';
import { updateUserPassword } from '../../../utils/user';
import { FormContainer, FormField, FormActions } from '../../common/forms';

/**
 * UpdatePasswordForm - Form to update user password
 * @param {function} onSuccess - Callback when password is updated successfully
 * @param {function} onClose - Callback to close the form/dialog
 */
export default function UpdatePasswordForm({ onSuccess, onClose }) {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
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
    try {
      await updateUserPassword({
        current_password: form.old_password,
        new_password: form.new_password,
      });
      setSuccess('Password updated successfully!');
      setForm({ old_password: '', new_password: '', confirm_password: '' });

      setTimeout(() => {
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      onSubmit={handleSubmit}
      onCancel={onClose}
      isForm={false}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <FormField
            label="Current Password"
            name="old_password"
            type="password"
            value={form.old_password}
            onChange={handleChange}
            required
            disabled={loading}
            xs={12}
          />
          <FormField
            label="New Password"
            name="new_password"
            type="password"
            value={form.new_password}
            onChange={handleChange}
            required
            disabled={loading}
            helperText="At least 6 characters"
            xs={12}
          />
          <FormField
            label="Confirm New Password"
            name="confirm_password"
            type="password"
            value={form.confirm_password}
            onChange={handleChange}
            required
            disabled={loading}
            xs={12}
          />
        </Grid>

        <FormActions
          submitText="Update Password"
          loading={loading}
          onCancel={onClose}
        />
      </Grid>
    </FormContainer>
  );
}
