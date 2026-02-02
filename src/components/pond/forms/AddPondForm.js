import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Grid,
  Alert,
  Paper,
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { POND_TYPES, FISH_WATER_SOURCES } from '../../../constants';
import { Pond } from '../../../models';
import { createPond } from '../../../services/pondService';
import { fetchFarms } from '../../../services/farmService';
import { FormContainer, FormSection, FormActions } from '../../common/forms';

/**
 * AddPondForm - Create a new pond
 * Pattern matches SamplingForm with proper dropdown handling and refresh
 */

export default function AddPondForm({ farmId, onSuccess, onCancel }) {
  const [farms, setFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => Pond.getDefaultFormData({ farmId }));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const mountedRef = useRef(true);

  const loadFarms = async () => {
    if (farmId) return;

    setLoadingFarms(true);
    try {
      const farmsList = await fetchFarms();
      if (!mountedRef.current) return;

      setFarms(farmsList || []);

      // Auto-select first farm if none selected
      setForm(prev => {
        if ((!prev.farm_id || prev.farm_id === '') && Array.isArray(farmsList) && farmsList.length > 0) {
          const firstFarm = farmsList[0];
          const selectedId = firstFarm.getFarmId ? firstFarm.getFarmId() :
                           String(firstFarm.farm_id || firstFarm._raw?.farm_id || '');
          return { ...prev, farm_id: selectedId };
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to load farms:', err);
    } finally {
      if (mountedRef.current) {
        setLoadingFarms(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadFarms();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReloadFarms = async () => {
    await loadFarms();
  };

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
      const result = await createPond(form);

      if (result.success) {
        setSuccess('Pond created successfully!');

        // Reset form with first farm selected using model method
        setForm(Pond.getDefaultFormData({ farms }));

        if (onSuccess) {
          setTimeout(() => onSuccess(result.pond), 1500);
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

  // Calculate capacity using model method
  const calculatedCapacity = Pond.calculateCapacityFromForm(form);

  return (
    <FormContainer
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isForm={false} // Internal form element used
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <FormSection title="Farm & Basic Details">
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
            {/* Farm Selection with Refresh Button */}
            {!farmId && (
              <Grid item xs={12}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={11}>
                    <TextField
                      select
                      label="Farm"
                      name="farm_id"
                      fullWidth
                      value={form.farm_id || ''}
                      onChange={handleChange}
                      required
                      helperText="Select the farm for this pond"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CheckCircleOutlineIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: loadingFarms ? (
                          <InputAdornment position="end">
                            <CircularProgress color="inherit" size={20} />
                          </InputAdornment>
                        ) : null,
                      }}
                    >
                      {farms.length === 0 ? (
                        <MenuItem disabled value="">
                          No farms found. Please create a farm first.
                        </MenuItem>
                      ) : (
                        farms.map((farm) => (
                          <MenuItem key={farm.getFarmId ? farm.getFarmId() : farm.farm_id} value={farm.getFarmId ? farm.getFarmId() : farm.farm_id}>
                            {farm.name || 'Unnamed Farm'}
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton onClick={handleReloadFarms} disabled={loadingFarms} title="Reload farms">
                      <RefreshIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            )}

            <Grid item xs={12} sm={8}>
              <TextField
                label="Pond Name"
                name="name"
                fullWidth
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g., Pond A1"
              />
            </Grid>

            {/* Pond Type */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Pond Type"
                name="pond_type"
                fullWidth
                value={form.pond_type || ''}
                onChange={handleChange}
                required
                helperText="Type of pond construction"
              >
                {POND_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Dimensions */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Area (m²)"
                name="area_sqm"
                type="number"
                fullWidth
                value={form.area_sqm || ''}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.1 }}
                helperText="Pond surface area"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Depth (m)"
                name="depth_m"
                type="number"
                fullWidth
                value={form.depth_m || ''}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.1 }}
                helperText="Average pond depth"
              />
            </Grid>

            {/* Calculated Capacity */}
            {calculatedCapacity > 0 && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ py: 0.5 }}>
                  Calculated Capacity: <strong>{calculatedCapacity.toLocaleString()} liters</strong>
                </Alert>
              </Grid>
            )}

            {/* Water Source */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Water Source"
                name="water_source"
                fullWidth
                value={form.water_source || ''}
                onChange={handleChange}
                helperText="Primary water source"
              >
                <MenuItem value="">
                  <em>Not specified</em>
                </MenuItem>
                {FISH_WATER_SOURCES.map((source) => (
                  <MenuItem key={source.value} value={source.value}>
                    {source.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Systems */}
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Aeration System"
                name="aeration_system"
                fullWidth
                value={form.aeration_system ? 'true' : 'false'}
                onChange={(e) => setForm(f => ({ ...f, aeration_system: e.target.value === 'true' }))}
              >
                <MenuItem value="false">No</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Filtration System"
                name="filtration_system"
                fullWidth
                value={form.filtration_system ? 'true' : 'false'}
                onChange={(e) => setForm(f => ({ ...f, filtration_system: e.target.value === 'true' }))}
              >
                <MenuItem value="false">No</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
              </TextField>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                fullWidth
                value={form.description || ''}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Additional notes about this pond..."
              />
            </Grid>
          </Grid>
        </FormSection>

        <FormActions
          loading={loading}
          onCancel={onCancel}
          onSubmit={handleSubmit}
          successMessage={success}
          errorMessage={error}
        />
      </Box>
    </FormContainer>
  );
}
