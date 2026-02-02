import React, { useState } from 'react';
import { Alert, Grid } from '@mui/material';
import { updateUserMobile } from '../../../utils/user';
import { FormContainer, FormField, FormActions } from '../../common/forms';

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
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!mobile) {
      setError('Mobile number is required');
      return;
    }

    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!phoneRegex.test(mobile)) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      await updateUserMobile(mobile);
      setSuccess('Mobile number updated successfully!');

      setTimeout(() => {
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to update mobile number');
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
            label="New Mobile Number"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            disabled={loading}
            placeholder="+1 234 567 8900"
            autoFocus
            xs={12}
          />
        </Grid>

        <FormActions
          submitText="Update Mobile"
          loading={loading}
          onCancel={onClose}
        />
      </Grid>
    </FormContainer>
  );
}
