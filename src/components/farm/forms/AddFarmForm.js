import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Stack,
  Alert
} from '@mui/material';
import { FISH_WATER_SOURCES } from '../../../constants';
import { Farm } from '../../../models';
import { createFarm } from '../../../services/farmService';

/**
 * AddFarmForm - Create a new farm
 * Clean component using farmService for all business logic
 */

export default function AddFarmForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(Farm.getDefaultFormData());
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
    setLoading(true);

    try {
      const result = await createFarm(form);

      if (result.success) {
        setSuccess('Farm created successfully!');
        setForm(Farm.getDefaultFormData());

        if (onSuccess) {
          setTimeout(() => onSuccess(result.farm), 1500);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Farm Name */}
      <TextField
        label="Farm Name *"
        name="name"
        fullWidth
        size="small"
        margin="dense"
        value={form.name}
        onChange={handleChange}
        required
        placeholder="e.g., Green Valley Farm"
      />

      {/* Address */}
      <TextField
        label="Address"
        name="address"
        fullWidth
        size="small"
        margin="dense"
        value={form.address}
        onChange={handleChange}
        placeholder="Street address"
      />

      {/* City, State, Country */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField
          label="City"
          name="city"
          size="small"
          value={form.city}
          onChange={handleChange}
          sx={{ flex: 1 }}
        />
        <TextField
          label="State"
          name="state"
          size="small"
          value={form.state}
          onChange={handleChange}
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField
          label="Country"
          name="country"
          size="small"
          value={form.country}
          onChange={handleChange}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Pincode"
          name="pincode"
          size="small"
          value={form.pincode}
          onChange={handleChange}
          sx={{ flex: 1 }}
        />
      </Stack>

      {/* Coordinates */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField
          label="Latitude"
          name="latitude"
          type="number"
          size="small"
          value={form.latitude}
          onChange={handleChange}
          sx={{ flex: 1 }}
          inputProps={{ step: 0.000001 }}
          placeholder="e.g., 13.0827"
        />
        <TextField
          label="Longitude"
          name="longitude"
          type="number"
          size="small"
          value={form.longitude}
          onChange={handleChange}
          sx={{ flex: 1 }}
          inputProps={{ step: 0.000001 }}
          placeholder="e.g., 80.2707"
        />
      </Stack>

      {/* Area */}
      <TextField
        label="Area (acres)"
        name="area_acres"
        type="number"
        size="small"
        fullWidth
        margin="dense"
        value={form.area_acres}
        onChange={handleChange}
        inputProps={{ min: 0, step: 0.1 }}
      />

      {/* Water Source */}
      <TextField
        select
        label="Primary Water Source"
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

      {/* Error/Success Messages */}
      {error && <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 1, py: 0.5 }}>{success}</Alert>}

      {/* Action Buttons */}
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" fullWidth type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Farm'}
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
