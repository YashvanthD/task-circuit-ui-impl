/**
 * EditSamplingDialog Component
 * Dialog for editing an existing sampling record
 *
 * @module components/sampling/EditSamplingDialog
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Typography,
} from '@mui/material';
import { ActionButton } from '../common';
import { formatDate, formatWeight } from '../../utils/formatters';

/**
 * EditSamplingDialog - Form for editing a sampling record
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close callback
 * @param {Object} props.sampling - Sampling instance to edit
 * @param {Object} props.stock - Stock instance
 * @param {Function} props.onSubmit - Submit callback (samplingData) => {}
 * @param {boolean} props.loading - Loading state
 */
export default function EditSamplingDialog({
  open,
  onClose,
  sampling,
  stock,
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState({
    sample_date: '',
    sample_count: '',
    avg_weight: '',
    min_weight_g: '',
    max_weight_g: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Initialize form when sampling changes
  useEffect(() => {
    if (sampling && open) {
      setForm({
        sample_date: sampling.sample_date || '',
        sample_count: sampling.sample_count || '',
        avg_weight: sampling.avg_weight_g || sampling.avg_weight || '',
        min_weight_g: sampling.min_weight_g || '',
        max_weight_g: sampling.max_weight_g || '',
        notes: sampling.notes || '',
      });
      setErrors({});
    }
  }, [sampling, open]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.sample_date) {
      newErrors.sample_date = 'Sample date is required';
    }

    if (!form.sample_count || Number(form.sample_count) <= 0) {
      newErrors.sample_count = 'Sample count must be greater than 0';
    }

    if (!form.avg_weight || Number(form.avg_weight) <= 0) {
      newErrors.avg_weight = 'Average weight must be greater than 0';
    }

    // Validate min/max weights if provided
    if (form.min_weight_g && form.max_weight_g) {
      const min = Number(form.min_weight_g);
      const max = Number(form.max_weight_g);
      if (min > max) {
        newErrors.min_weight_g = 'Min weight cannot be greater than max weight';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Create update data with snake_case fields (backend requirement)
    const updateData = {
      sampling_id: sampling.sampling_id,
      sample_date: form.sample_date,
      sample_count: Number(form.sample_count),
      avg_weight_g: Number(form.avg_weight),
      notes: form.notes || '',
    };

    // Add optional fields if provided
    if (form.min_weight_g) {
      updateData.min_weight_g = Number(form.min_weight_g);
    }
    if (form.max_weight_g) {
      updateData.max_weight_g = Number(form.max_weight_g);
    }

    if (onSubmit) {
      onSubmit(updateData);
    }
  };

  if (!sampling || !stock) return null;

  // Calculate growth vs initial
  const initialWeight = stock.initial_avg_weight_g || 0;
  const newWeight = Number(form.avg_weight) || 0;
  const growth = newWeight - initialWeight;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Edit Sampling Record
        </DialogTitle>

        <DialogContent dividers>
          {/* Stock Info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Stock:</strong> {stock.species_name || 'Unknown'}
            </Typography>
            <Typography variant="body2">
              <strong>Pond:</strong> {stock.pond_name || stock.pond_id}
            </Typography>
            <Typography variant="body2">
              <strong>Original Date:</strong> {formatDate(sampling.sample_date)}
            </Typography>
            <Typography variant="body2">
              <strong>Original Count:</strong> {sampling.sample_count}
            </Typography>
            <Typography variant="body2">
              <strong>Original Weight:</strong> {formatWeight(sampling.avg_weight_g || sampling.avg_weight)}
            </Typography>
          </Box>

          {/* Form Fields */}
          <TextField
            label="Sample Date"
            type="date"
            value={form.sample_date}
            onChange={(e) => handleChange('sample_date', e.target.value)}
            fullWidth
            required
            error={!!errors.sample_date}
            helperText={errors.sample_date || 'Date when sampling was performed'}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Sample Count"
            type="number"
            value={form.sample_count}
            onChange={(e) => handleChange('sample_count', e.target.value)}
            fullWidth
            required
            error={!!errors.sample_count}
            helperText={errors.sample_count || 'Number of fish sampled'}
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Average Weight (grams)"
            type="number"
            value={form.avg_weight}
            onChange={(e) => handleChange('avg_weight', e.target.value)}
            fullWidth
            required
            error={!!errors.avg_weight}
            helperText={errors.avg_weight || 'Average weight of sampled fish in grams'}
            inputProps={{ min: 0.1, step: 0.1 }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Minimum Weight (grams)"
            type="number"
            value={form.min_weight_g}
            onChange={(e) => handleChange('min_weight_g', e.target.value)}
            fullWidth
            error={!!errors.min_weight_g}
            helperText={errors.min_weight_g || 'Optional: Minimum weight observed'}
            inputProps={{ min: 0.1, step: 0.1 }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Maximum Weight (grams)"
            type="number"
            value={form.max_weight_g}
            onChange={(e) => handleChange('max_weight_g', e.target.value)}
            fullWidth
            error={!!errors.max_weight_g}
            helperText={errors.max_weight_g || 'Optional: Maximum weight observed'}
            inputProps={{ min: 0.1, step: 0.1 }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Notes"
            multiline
            rows={3}
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            fullWidth
            placeholder="Additional observations..."
            helperText="Optional: Any observations or notes about this sampling"
          />

          {/* Growth Preview */}
          {newWeight > 0 && (
            <Alert
              severity={growth >= 0 ? 'success' : 'warning'}
              sx={{ mt: 2 }}
            >
              <Typography variant="body2">
                <strong>Growth vs Initial:</strong> {growth >= 0 ? '+' : ''}{growth.toFixed(1)}g
                {' '}({initialWeight.toFixed(1)}g → {newWeight.toFixed(1)}g)
              </Typography>
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <ActionButton
            onClick={onClose}
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </ActionButton>
          <ActionButton
            type="submit"
            loading={loading}
            variant="contained"
            color="primary"
          >
            Update Sampling
          </ActionButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
