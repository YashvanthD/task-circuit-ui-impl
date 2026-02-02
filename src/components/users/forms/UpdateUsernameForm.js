import React, { useState } from 'react';
import { Alert, Grid } from '@mui/material';
import { updateUsername } from '../../../utils/user';
import { FormContainer, FormField, FormActions } from '../../common/forms';

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
    if (e) e.preventDefault();
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

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    try {
      await updateUsername(username);
      setSuccess('Username updated successfully!');

      setTimeout(() => {
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to update username');
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
            label="New Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            helperText="At least 3 characters, letters, numbers, and underscores only"
            autoFocus
            xs={12}
          />
        </Grid>

        <FormActions
          submitText="Update Username"
          loading={loading}
          onCancel={onClose}
        />
      </Grid>
    </FormContainer>
  );
}
