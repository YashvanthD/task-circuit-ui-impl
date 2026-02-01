import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Alert
} from '@mui/material';
import { apiFetch } from '../../../api';
import { API_FISH } from '../../../api/constants';

/**
 * WaterQualityForm - Record water quality parameters
 * Aligned with UC-10: Water Quality Monitoring
 * API: PUT /api/fish/ponds/{pond_id}/water-quality
 *
 * Backend water_quality schema:
 * - ph (4.0-10.0)
 * - temperature (°C)
 * - dissolved_oxygen (mg/L)
 * - ammonia (mg/L)
 * - nitrite (mg/L)
 * - turbidity (NTU)
 * - last_checked (datetime)
 */

// Threshold definitions for visual feedback
const THRESHOLDS = {
  ph: { ideal: [7.0, 7.5], warning: [6.5, 9.0], unit: '' },
  dissolved_oxygen: { ideal: [6, 999], warning: [4, 6], unit: 'mg/L' },
  temperature: { ideal: [28, 30], warning: [25, 32], unit: '°C' },
  ammonia: { ideal: [0, 0.02], warning: [0.02, 0.5], unit: 'mg/L' },
  nitrite: { ideal: [0, 0.1], warning: [0.1, 0.5], unit: 'mg/L' },
  turbidity: { ideal: [0, 30], warning: [30, 50], unit: 'NTU' }
};

const getStatus = (value, param) => {
  if (!value || !THRESHOLDS[param]) return 'normal';
  const val = parseFloat(value);
  const { ideal, warning } = THRESHOLDS[param];

  if (val >= ideal[0] && val <= ideal[1]) return 'ideal';
  if (val >= warning[0] && val <= warning[1]) return 'warning';
  return 'critical';
};

const getStatusColor = (status) => {
  switch (status) {
    case 'ideal': return 'success';
    case 'warning': return 'warning';
    case 'critical': return 'error';
    default: return 'info';
  }
};

export default function WaterQualityForm({ pondId, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ph: '',
    temperature: '',
    dissolved_oxygen: '',
    ammonia: '',
    nitrite: '',
    turbidity: '',
    reading_date: new Date().toISOString().split('T')[0],
    reading_time: new Date().toTimeString().slice(0, 5),
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pondId) {
      setError('Pond ID is required');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        reading_date: form.reading_date,
        reading_time: form.reading_time,
        ph: form.ph ? parseFloat(form.ph) : undefined,
        temperature: form.temperature ? parseFloat(form.temperature) : undefined,
        dissolved_oxygen: form.dissolved_oxygen ? parseFloat(form.dissolved_oxygen) : undefined,
        ammonia: form.ammonia ? parseFloat(form.ammonia) : undefined,
        nitrite: form.nitrite ? parseFloat(form.nitrite) : undefined,
        turbidity: form.turbidity ? parseFloat(form.turbidity) : undefined,
        notes: form.notes || undefined
      };

      const res = await apiFetch(API_FISH.POND_WATER_QUALITY(pondId), {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Water quality updated successfully!');

        if (onSuccess) {
          setTimeout(() => onSuccess(data.data), 1500);
        }
      } else {
        setError(data.error || data.message || 'Failed to update water quality');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit} sx={{ maxWidth: 700, mx: 'auto' }}>
      {/* Date & Time */}
      <Stack direction="row" spacing={1}>
        <TextField
          label="Date"
          name="reading_date"
          type="date"
          size="small"
          value={form.reading_date}
          onChange={handleChange}
          sx={{ flex: 1 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Time"
          name="reading_time"
          type="time"
          size="small"
          value={form.reading_time}
          onChange={handleChange}
          sx={{ flex: 1 }}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      {/* Water Parameters - Row 1 */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField
          label="pH"
          name="ph"
          type="number"
          size="small"
          fullWidth
          value={form.ph}
          onChange={handleChange}
          inputProps={{ min: 0, max: 14, step: 0.1 }}
          helperText="7.0-7.5"
          color={getStatusColor(getStatus(form.ph, 'ph'))}
        />
        <TextField
          label="Temp (°C)"
          name="temperature"
          type="number"
          size="small"
          fullWidth
          value={form.temperature}
          onChange={handleChange}
          inputProps={{ min: 0, max: 50, step: 0.1 }}
          helperText="28-30"
          color={getStatusColor(getStatus(form.temperature, 'temperature'))}
        />
        <TextField
          label="DO (mg/L)"
          name="dissolved_oxygen"
          type="number"
          size="small"
          fullWidth
          value={form.dissolved_oxygen}
          onChange={handleChange}
          inputProps={{ min: 0, step: 0.1 }}
          helperText=">6"
          color={getStatusColor(getStatus(form.dissolved_oxygen, 'dissolved_oxygen'))}
        />
      </Stack>

      {/* Water Parameters - Row 2 */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField
          label="NH₃ (mg/L)"
          name="ammonia"
          type="number"
          size="small"
          fullWidth
          value={form.ammonia}
          onChange={handleChange}
          inputProps={{ min: 0, step: 0.01 }}
          helperText="<0.02"
          color={getStatusColor(getStatus(form.ammonia, 'ammonia'))}
        />
        <TextField
          label="NO₂ (mg/L)"
          name="nitrite"
          type="number"
          size="small"
          fullWidth
          value={form.nitrite}
          onChange={handleChange}
          inputProps={{ min: 0, step: 0.01 }}
          helperText="<0.1"
          color={getStatusColor(getStatus(form.nitrite, 'nitrite'))}
        />
        <TextField
          label="Turbidity (NTU)"
          name="turbidity"
          type="number"
          size="small"
          fullWidth
          value={form.turbidity}
          onChange={handleChange}
          inputProps={{ min: 0, step: 0.1 }}
          helperText="<30"
          color={getStatusColor(getStatus(form.turbidity, 'turbidity'))}
        />
      </Stack>

      {/* Notes */}
      <TextField
        label="Notes"
        name="notes"
        fullWidth
        size="small"
        margin="dense"
        value={form.notes}
        onChange={handleChange}
        multiline
        rows={2}
        placeholder="Observations..."
      />

      {/* Error/Success Messages */}
      {error && <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 1, py: 0.5 }}>{success}</Alert>}

      {/* Action Buttons */}
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" fullWidth type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Water Quality'}
        </Button>
        {onCancel && (
          <Button variant="outlined" fullWidth onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
      </Stack>
    </Box>
  );
}
