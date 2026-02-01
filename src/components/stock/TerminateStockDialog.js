/**
 * TerminateStockDialog Component
 * Dialog for terminating/closing a stock
 *
 * @module components/stock/TerminateStockDialog
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Alert,
  MenuItem,
} from '@mui/material';
import { ActionButton } from '../common';
import { formatCount, formatWeight, formatDate } from '../../utils/formatters';

/**
 * TerminateStockDialog - Form for terminating a stock
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close callback
 * @param {Object} props.stock - Stock instance to terminate
 * @param {Function} props.onSubmit - Submit callback (terminationData) => {}
 * @param {boolean} props.loading - Loading state
 */
export default function TerminateStockDialog({
  open,
  onClose,
  stock,
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState({
    termination_date: new Date().toISOString().split('T')[0],
    termination_reason: '',
    final_count: stock?.current_count || 0,
    notes: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.termination_date) {
      alert('Please select a termination date');
      return;
    }

    if (!form.termination_reason) {
      alert('Please select a termination reason');
      return;
    }

    const terminationData = {
      termination_date: form.termination_date,
      termination_reason: form.termination_reason,
      final_count: Number(form.final_count),
      notes: form.notes || '',
    };

    if (onSubmit) {
      onSubmit(terminationData);
    }
  };

  if (!stock) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Terminate Stock
        </DialogTitle>

        <DialogContent dividers>
          {/* Warning */}
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action will close this stock. You won't be able to add more samplings after termination.
            </Typography>
          </Alert>

          {/* Stock Info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Stock ID:</strong> {stock.stock_id}
            </Typography>
            <Typography variant="body2">
              <strong>Species:</strong> {stock.species_name || 'Unknown'}
            </Typography>
            <Typography variant="body2">
              <strong>Pond:</strong> {stock.pond_name || stock.pond_id}
            </Typography>
            <Typography variant="body2">
              <strong>Stocked:</strong> {formatDate(stock.stocking_date)}
            </Typography>
            <Typography variant="body2">
              <strong>Initial Count:</strong> {formatCount(stock.initial_count)}
            </Typography>
            <Typography variant="body2">
              <strong>Current Count:</strong> {formatCount(stock.current_count)}
            </Typography>
            <Typography variant="body2">
              <strong>Current Avg Weight:</strong> {formatWeight(stock.initial_avg_weight_g)}
            </Typography>
          </Box>

          {/* Form Fields */}
          <TextField
            label="Termination Date"
            type="date"
            value={form.termination_date}
            onChange={(e) => handleChange('termination_date', e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: stock.stocking_date,
              max: new Date().toISOString().split('T')[0],
            }}
          />

          <TextField
            label="Termination Reason"
            select
            value={form.termination_reason}
            onChange={(e) => handleChange('termination_reason', e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            helperText="Why is this stock being terminated?"
          >
            <MenuItem value="full_harvest">Full Harvest (Sold/Consumed)</MenuItem>
            <MenuItem value="partial_harvest">Partial Harvest (Remaining sold)</MenuItem>
            <MenuItem value="transfer">Transferred to another pond</MenuItem>
            <MenuItem value="mortality">High Mortality</MenuItem>
            <MenuItem value="disease">Disease Outbreak</MenuItem>
            <MenuItem value="pond_maintenance">Pond Maintenance Required</MenuItem>
            <MenuItem value="market_conditions">Market Conditions</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>

          <TextField
            label="Final Count"
            type="number"
            value={form.final_count}
            onChange={(e) => handleChange('final_count', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ min: 0, max: stock.current_count }}
            helperText={`How many fish remain? (Current: ${formatCount(stock.current_count)})`}
          />

          <TextField
            label="Notes"
            multiline
            rows={3}
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            fullWidth
            placeholder="Additional notes about the termination..."
            helperText="Optional: Add any additional information"
          />
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
            color="error"
          >
            Terminate Stock
          </ActionButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
