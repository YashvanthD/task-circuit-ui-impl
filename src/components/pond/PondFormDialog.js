/**
 * PondFormDialog Component
 * Dialog for creating and editing ponds.
 *
 * @module components/pond/PondFormDialog
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

import { POND_STATUS } from '../../constants';

/**
 * PondFormDialog - Reusable dialog for pond creation and editing.
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
 */
export default function PondFormDialog({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  error,
  errors = {},
  onDelete,
}) {
  const isEdit = !!form.pond_id || !!form.id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...form, [name]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Pond' : 'Add New Pond'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Pond Name *"
              name="name"
              value={form.name || ''}
              onChange={handleChange}
              required
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Size (sq.m)"
              name="size"
              type="number"
              value={form.size || ''}
              onChange={handleChange}
              fullWidth
              error={!!errors.size}
              helperText={errors.size}
            />
            <TextField
              label="Location"
              name="location"
              value={form.location || ''}
              onChange={handleChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status || 'active'}
                label="Status"
                onChange={handleChange}
              >
                {POND_STATUS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Fish Type"
              name="fish_type"
              value={form.fish_type || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Fish Count"
              name="fish_count"
              type="number"
              value={form.fish_count || ''}
              onChange={handleChange}
              fullWidth
              error={!!errors.fish_count}
              helperText={errors.fish_count}
            />
            <TextField
              label="Start Date"
              name="start_date"
              type="date"
              value={form.start_date || ''}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Notes"
              name="notes"
              value={form.notes || ''}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
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

