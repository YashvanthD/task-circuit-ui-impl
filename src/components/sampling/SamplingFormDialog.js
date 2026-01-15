/**
 * SamplingFormDialog Component
 * Dialog for creating and editing samplings.
 *
 * @module components/sampling/SamplingFormDialog
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

import { SAMPLING_STATUS_OPTIONS } from '../../constants';

/**
 * SamplingFormDialog - Reusable dialog for sampling creation and editing.
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.form - Form state
 * @param {Function} props.onChange - Form change handler
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Array} props.ponds - List of ponds for selection
 * @param {string} props.error - Error message
 * @param {Object} props.errors - Field-level errors
 */
export default function SamplingFormDialog({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  ponds = [],
  error,
  errors = {},
}) {
  const isEdit = !!form.sampling_id || !!form.id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...form, [name]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Sampling' : 'Schedule New Sampling'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <FormControl fullWidth error={!!errors.pond_id}>
              <InputLabel>Pond *</InputLabel>
              <Select
                name="pond_id"
                value={form.pond_id || ''}
                label="Pond *"
                onChange={handleChange}
                required
              >
                {ponds.map((pond) => (
                  <MenuItem key={pond.pond_id || pond.id} value={pond.pond_id || pond.id}>
                    {pond.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.pond_id && (
                <Typography variant="caption" color="error">
                  {errors.pond_id}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Sample Type *"
              name="sample_type"
              value={form.sample_type || ''}
              onChange={handleChange}
              required
              fullWidth
              error={!!errors.sample_type}
              helperText={errors.sample_type}
              placeholder="e.g., Water Quality, Fish Health"
            />
            <TextField
              label="Scheduled Date *"
              name="scheduled_date"
              type="date"
              value={form.scheduled_date || ''}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.scheduled_date}
              helperText={errors.scheduled_date}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status || 'scheduled'}
                label="Status"
                onChange={handleChange}
              >
                {SAMPLING_STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

