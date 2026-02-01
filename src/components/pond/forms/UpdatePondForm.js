import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { apiFetch } from '../../../api';
import { API_FISH } from '../../../api/constants';
import { POND_TYPES, FISH_WATER_SOURCES, POND_STATUS } from '../../../constants/pondConstants';

/**
 * UpdatePondForm - Update existing pond details
 * Aligned with backend schema: PUT /api/fish/ponds/{pond_id}
 *
 * Updatable fields:
 * - name
 * - pond_type
 * - area_sqm
 * - depth_m
 * - water_source
 * - aeration_system
 * - filtration_system
 * - description
 * - status (empty | preparing | stocked | harvesting | maintenance)
 */


export default function UpdatePondForm({ pondId, initialData, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(!initialData);
  const [form, setForm] = useState({
    name: '',
    pond_type: 'earthen',
    area_sqm: '',
    depth_m: '',
    water_source: '',
    aeration_system: false,
    filtration_system: false,
    description: '',
    status: 'empty'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [calculatedCapacity, setCalculatedCapacity] = useState(0);

  // Fetch pond data if not provided
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        pond_type: initialData.pond_type || 'earthen',
        area_sqm: initialData.area_sqm || '',
        depth_m: initialData.depth_m || '',
        water_source: initialData.water_source || '',
        aeration_system: initialData.aeration_system || false,
        filtration_system: initialData.filtration_system || false,
        description: initialData.description || '',
        status: initialData.status || 'empty'
      });
      setFetchingData(false);
    } else if (pondId) {
      fetchPondData();
    }
  }, [pondId, initialData]);

  // Calculate capacity when area or depth changes
  useEffect(() => {
    if (form.area_sqm && form.depth_m) {
      const capacity = parseFloat(form.area_sqm) * parseFloat(form.depth_m) * 1000;
      setCalculatedCapacity(capacity);
    } else {
      setCalculatedCapacity(0);
    }
  }, [form.area_sqm, form.depth_m]);

  const fetchPondData = async () => {
    setFetchingData(true);
    try {
      const res = await apiFetch(API_FISH.POND_DETAIL(pondId));
      const data = await res.json();
      if (data.success && data.data) {
        const pond = data.data;
        setForm({
          name: pond.name || '',
          pond_type: pond.pond_type || 'earthen',
          area_sqm: pond.area_sqm || '',
          depth_m: pond.depth_m || '',
          water_source: pond.water_source || '',
          aeration_system: pond.aeration_system || false,
          filtration_system: pond.filtration_system || false,
          description: pond.description || '',
          status: pond.status || 'empty'
        });
      } else {
        setError('Failed to fetch pond data');
      }
    } catch (err) {
      setError('Failed to fetch pond data: ' + err.message);
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!pondId) {
      setError('Pond ID is required');
      return;
    }
    if (!form.name) {
      setError('Pond name is required');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        name: form.name,
        pond_type: form.pond_type,
        area_sqm: form.area_sqm ? parseFloat(form.area_sqm) : undefined,
        depth_m: form.depth_m ? parseFloat(form.depth_m) : undefined,
        water_source: form.water_source || undefined,
        aeration_system: form.aeration_system,
        filtration_system: form.filtration_system,
        description: form.description || undefined,
        status: form.status
      };

      const res = await apiFetch(API_FISH.POND_UPDATE(pondId), {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Pond updated successfully!');

        if (onSuccess) {
          setTimeout(() => onSuccess(data.data), 1500);
        }
      } else {
        setError(data.error || data.message || 'Failed to update pond');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CircularProgress size={30} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Pond Name */}
      <TextField
        label="Pond Name *"
        name="name"
        fullWidth
        size="small"
        margin="dense"
        value={form.name}
        onChange={handleChange}
        required
        placeholder="e.g., Pond A1"
      />

      {/* Pond Type & Status */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField
          select
          label="Type *"
          name="pond_type"
          size="small"
          value={form.pond_type}
          onChange={handleChange}
          required
          sx={{ flex: 1 }}
        >
          {POND_TYPES.map((type) => (
            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Status *"
          name="status"
          size="small"
          value={form.status}
          onChange={handleChange}
          required
          sx={{ flex: 1 }}
        >
          {POND_STATUS.map((status) => (
            <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* Dimensions */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField
          label="Area (m²)"
          name="area_sqm"
          type="number"
          size="small"
          value={form.area_sqm}
          onChange={handleChange}
          sx={{ flex: 1 }}
          inputProps={{ min: 0, step: 0.1 }}
        />
        <TextField
          label="Depth (m)"
          name="depth_m"
          type="number"
          size="small"
          value={form.depth_m}
          onChange={handleChange}
          sx={{ flex: 1 }}
          inputProps={{ min: 0, step: 0.1 }}
        />
      </Stack>

      {/* Calculated Capacity */}
      {calculatedCapacity > 0 && (
        <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5, ml: 1 }}>
          Capacity: {calculatedCapacity.toLocaleString()} liters
        </Typography>
      )}

      {/* Water Source */}
      <TextField
        select
        label="Water Source"
        name="water_source"
        fullWidth
        size="small"
        margin="dense"
        value={form.water_source}
        onChange={handleChange}
      >
        <MenuItem value=""><em>Not specified</em></MenuItem>
        {FISH_WATER_SOURCES.map((source) => (
          <MenuItem key={source.value} value={source.value}>{source.label}</MenuItem>
        ))}
      </TextField>

      {/* Systems */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField
          select
          label="Aeration"
          name="aeration_system"
          size="small"
          value={form.aeration_system}
          onChange={(e) => handleChange({ target: { name: 'aeration_system', value: e.target.value === 'true', type: 'checkbox', checked: e.target.value === 'true' } })}
          sx={{ flex: 1 }}
        >
          <MenuItem value={false}>No</MenuItem>
          <MenuItem value={true}>Yes</MenuItem>
        </TextField>
        <TextField
          select
          label="Filtration"
          name="filtration_system"
          size="small"
          value={form.filtration_system}
          onChange={(e) => handleChange({ target: { name: 'filtration_system', value: e.target.value === 'true', type: 'checkbox', checked: e.target.value === 'true' } })}
          sx={{ flex: 1 }}
        >
          <MenuItem value={false}>No</MenuItem>
          <MenuItem value={true}>Yes</MenuItem>
        </TextField>
      </Stack>

      {/* Description */}
      <TextField
        label="Description"
        name="description"
        fullWidth
        size="small"
        margin="dense"
        value={form.description}
        onChange={handleChange}
        multiline
        rows={2}
        placeholder="Notes..."
      />

      {/* Error/Success Messages */}
      {error && <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 1, py: 0.5 }}>{success}</Alert>}

      {/* Action Buttons */}
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" fullWidth type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Pond'}
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
