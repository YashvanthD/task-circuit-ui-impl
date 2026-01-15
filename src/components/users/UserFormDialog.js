/**
 * UserFormDialog Component
 * Dialog for creating and editing users.
 *
 * @module components/users/UserFormDialog
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  Button,
  Typography,
} from '@mui/material';

import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from '../../constants';

/**
 * UserFormDialog - Reusable dialog for user creation and editing.
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.form - Form state
 * @param {Function} props.onChange - Form change handler
 * @param {Function} props.onSubmit - Form submit handler
 * @param {string} props.error - Error message
 * @param {Object} props.errors - Field-level errors
 * @param {Function} props.onDelete - Delete handler (optional)
 * @param {boolean} props.canChangeRole - Whether role can be changed
 */
export default function UserFormDialog({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  error,
  errors = {},
  onDelete,
  canChangeRole = true,
}) {
  const isEdit = !!form.user_id || !!form.user_key || !!form.id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...form, [name]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Username *"
              name="username"
              value={form.username || ''}
              onChange={handleChange}
              required
              fullWidth
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              label="Email *"
              name="email"
              type="email"
              value={form.email || ''}
              onChange={handleChange}
              required
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Phone"
              name="phone"
              value={form.phone || ''}
              onChange={handleChange}
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone}
            />
            <TextField
              label="Department"
              name="department"
              value={form.department || ''}
              onChange={handleChange}
              fullWidth
            />
            <FormControl fullWidth disabled={!canChangeRole}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={form.role || 'operator'}
                label="Role"
                onChange={handleChange}
              >
                {USER_ROLE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status || 'active'}
                label="Status"
                onChange={handleChange}
              >
                {USER_STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && <Typography color="error">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          {isEdit && onDelete && (
            <Button onClick={onDelete} variant="contained" color="error" sx={{ mr: 'auto' }}>
              Delete
            </Button>
          )}
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

