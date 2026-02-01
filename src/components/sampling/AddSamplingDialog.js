/**
 * AddSamplingDialog Component
 * Dialog for adding a new sampling record
 *
 * @module components/sampling/AddSamplingDialog
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { ActionButton, FormContainer, FormSection, FormField } from '../common';
import { Sampling } from '../../models';
import { formatWeight, formatDate } from '../../utils/formatters';

/**
 * AddSamplingDialog - Form dialog for adding sampling
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close callback
 * @param {Object} props.stock - Stock instance
 * @param {Function} props.onSubmit - Submit callback (samplingData) => {}
 * @param {boolean} props.loading - Loading state
 */
export default function AddSamplingDialog({
  open,
  onClose,
  stock,
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState(Sampling.getDefaultFormData());
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open && stock) {
      setForm({
        ...Sampling.getDefaultFormData(),
        stock_id: stock.stock_id,
        pond_id: stock.pond_id,
        species: stock.species_name,
      });
      setErrors({});
    }
  }, [open, stock]);

  // Auto-calculate average weight
  useEffect(() => {
    if (form.sample_count && form.total_weight) {
      const avgWeight = Number(form.total_weight) / Number(form.sample_count);
      if (!isNaN(avgWeight)) {
        setForm(prev => ({ ...prev, avg_weight: avgWeight.toFixed(2) }));
      }
    }
  }, [form.sample_count, form.total_weight]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.sample_date) {
      newErrors.sample_date = 'Sample date is required';
    }

    if (!form.sample_count || form.sample_count <= 0) {
      newErrors.sample_count = 'Sample count must be greater than 0';
    }

    if (form.sample_count > stock.current_count) {
      newErrors.sample_count = `Cannot exceed stock count (${stock.current_count})`;
    }

    if (!form.avg_weight && !form.total_weight) {
      newErrors.avg_weight = 'Either average weight or total weight is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Create sampling data matching backend API from uc-05-growth-sampling.md
    const samplingData = {
      stock_id: stock.stock_id,
      pond_id: stock.pond_id,
      sample_date: form.sample_date,     // Backend expects sample_date
      sample_count: Number(form.sample_count), // Backend expects sample_count
      avg_weight_g: Number(form.avg_weight),  // Backend expects avg_weight_g
      notes: form.notes || '',
    };

    // Remove empty/undefined values
    Object.keys(samplingData).forEach(key => {
      if (samplingData[key] === '' || samplingData[key] === undefined) {
        delete samplingData[key];
      }
    });

    if (onSubmit) {
      onSubmit(samplingData);
    }
  };

  if (!stock) return null;

  // Get latest weight for context
  const previousWeight = stock.initial_avg_weight_g || 0;
  const currentWeight = form.avg_weight || 0;
  const growthSinceInitial = currentWeight - previousWeight;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Add Sampling Record
        </DialogTitle>

        <DialogContent dividers>
          {/* Stock Context */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Stock:</strong> {stock.species_name || 'Unknown'}<br />
              <strong>Pond:</strong> {stock.pond_id}<br />
              <strong>Current Count:</strong> {stock.current_count} fish<br />
              <strong>Last Weight:</strong> {formatWeight(previousWeight)}<br />
              <strong>Stocked:</strong> {formatDate(stock.stocking_date)} ({stock.getDaysSinceStocking()} days ago)
            </Typography>
          </Alert>

          <FormContainer>
            <FormSection
              title="Sampling Details"
              subtitle="Record the fish sampling measurements"
            >
              <FormField
                type="date"
                label="Sampling Date"
                value={form.sample_date}
                onChange={(e) => handleChange('sample_date', e.target.value)}
                fullWidth
                error={errors.sample_date}
                helperText={errors.sample_date || 'Date when sampling was performed'}
                xs={12}
              />

              <FormField
                type="number"
                label="Sample Count"
                value={form.sample_count}
                onChange={(e) => handleChange('sample_count', e.target.value)}
                required
                error={errors.sample_count}
                helperText={errors.sample_count || 'Number of fish sampled'}
                inputProps={{ min: 1, max: stock.current_count }}
                xs={12} sm={6}
              />

              <FormField
                type="number"
                label="Total Weight (g)"
                value={form.total_weight}
                onChange={(e) => handleChange('total_weight', e.target.value)}
                error={errors.total_weight}
                helperText="Total weight of all sampled fish"
                inputProps={{ min: 0, step: 0.1 }}
                xs={12} sm={6}
              />

              <FormField
                type="number"
                label="Average Weight (g)"
                value={form.avg_weight}
                onChange={(e) => handleChange('avg_weight', e.target.value)}
                error={errors.avg_weight}
                helperText={errors.avg_weight || 'Auto-calculated from total weight'}
                inputProps={{ min: 0, step: 0.1 }}
                xs={12} sm={6}
                disabled={Boolean(form.total_weight && form.sample_count)}
              />

              {currentWeight > 0 && (
                <Box sx={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Growth since stocking:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: growthSinceInitial >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {growthSinceInitial >= 0 ? '+' : ''}{growthSinceInitial.toFixed(1)}g
                  </Typography>
                </Box>
              )}

              <FormField
                type="textarea"
                label="Notes"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                helperText="Additional observations (optional)"
                minRows={3}
                xs={12}
              />
            </FormSection>
          </FormContainer>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
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
            Add Sampling
          </ActionButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
