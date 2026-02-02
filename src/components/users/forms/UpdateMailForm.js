import React, { useState } from 'react';
import { Alert, Grid } from '@mui/material';
import { updateUserEmail } from '../../../utils/user';
import { FormContainer, FormField, FormActions } from '../../common/forms';

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
    if (e) e.preventDefault();
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
    try {
      await updateUserEmail(email);
      setSuccess('Email updated successfully!');

      setTimeout(() => {
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      onSubmit={handleSubmit}
      onCancel={onClose}
      isForm={false} // Container provides Paper, we manually wrap form internals
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <FormField
            label="New Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="user@example.com"
            autoFocus
            xs={12}
          />
        </Grid>

        <FormActions
          submitText="Update Email"
          loading={loading}
          onCancel={onClose}
        />
      </Grid>
    </FormContainer>
  );
}
