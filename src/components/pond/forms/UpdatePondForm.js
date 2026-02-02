import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Grid,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import WavesIcon from '@mui/icons-material/Waves';
import LayersIcon from '@mui/icons-material/Layers';
import HeightIcon from '@mui/icons-material/Height';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { apiFetch } from '../../../api';
import { API_FISH } from '../../../api/constants';
import { POND_TYPES, FISH_WATER_SOURCES, POND_STATUS } from '../../../constants/pondConstants';
import { FormContainer, FormSection, FormActions } from '../../common/forms';

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


export default function UpdatePondForm({ pondId, initialData, onSuccess, onCancel, onDelete }) {
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
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await apiFetch(API_FISH.POND_UPDATE(pondId), {
        method: 'PUT',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Pond updated successfully!');
        if (onSuccess) {
          setTimeout(() => onSuccess(data.data), 1000);
        }
      } else {
        setError(data.error || 'Failed to update pond');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <FormContainer
      title={`Edit Pond: ${form.name}`}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isForm={false} // Container provides the UI, but we use internal form elements
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <FormSection title="Basic Information" subtitle="Update name and status">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Pond Name"
              name="name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EditIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Status"
              name="status"
              fullWidth
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CheckCircleOutlineIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {POND_STATUS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Pond Type"
              name="pond_type"
              fullWidth
              value={form.pond_type}
              onChange={(e) => setForm({ ...form, pond_type: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LayersIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {POND_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Water Source"
              name="water_source"
              fullWidth
              value={form.water_source}
              onChange={(e) => setForm({ ...form, water_source: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WavesIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {FISH_WATER_SOURCES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </FormSection>

      <FormSection title="Dimensions & Equipment" subtitle="Pond size and installed systems">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Area (sqm)"
              name="area_sqm"
              type="number"
              fullWidth
              value={form.area_sqm}
              onChange={(e) => setForm({ ...form, area_sqm: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LayersIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">m²</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Depth (m)"
              name="depth_m"
              type="number"
              fullWidth
              value={form.depth_m}
              onChange={(e) => setForm({ ...form, depth_m: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HeightIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">m</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.aeration_system}
                  onChange={(e) => setForm({ ...form, aeration_system: e.target.checked })}
                />
              }
              label="Aeration System"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.filtration_system}
                  onChange={(e) => setForm({ ...form, filtration_system: e.target.checked })}
                />
              }
              label="Filtration System"
            />
          </Grid>
        </Grid>
      </FormSection>

      <FormSection title="Additional Notes">
        <TextField
          label="Description"
          name="description"
          multiline
          rows={3}
          fullWidth
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                <DescriptionIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </FormSection>

      <FormActions
        onCancel={onCancel}
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Update Pond"
      >
        {onDelete && (
          <Button
            variant="text"
            color="error"
            onClick={() => onDelete(pondId)}
            sx={{ mr: 'auto' }}
          >
            Delete Pond
          </Button>
        )}
      </FormActions>
    </FormContainer>
  );
}
