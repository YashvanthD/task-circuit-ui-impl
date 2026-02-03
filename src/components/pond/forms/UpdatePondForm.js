import React, { useState, useEffect, useCallback } from 'react';
import {
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Button,
  Grid,
} from '@mui/material';
import { updatePond } from '../../../services/pondService';
import { apiFetch } from '../../../api';
import { API_FISH } from '../../../api/constants';
import { POND_TYPES, FISH_WATER_SOURCES, POND_STATUS } from '../../../constants';
import { FormContainer, FormSection, FormActions, FormField, FormDropdown } from '../../common/forms';

/**
 * UpdatePondForm - Update existing pond details
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

  // Fetch pond data if not provided
  const fetchPondData = useCallback(async () => {
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
  }, [pondId]);

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
  }, [pondId, initialData, fetchPondData]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await updatePond(pondId, form);

      if (result.success) {
        setSuccess('Pond updated successfully!');
        if (onSuccess) {
          setTimeout(() => onSuccess(result.pond), 1000);
        }
      } else {
        setError(result.error || 'Failed to update pond');
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
      isForm={false}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <FormSection title="Basic Information" subtitle="Update name and status">
        <Grid container spacing={3}>
          <FormField
            label="Pond Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            xs={12} sm={8}
          />
          <FormDropdown
            label="Status"
            value={form.status}
            onChange={(e, val) => handleChange('status', val)}
            options={POND_STATUS || []}
            required
            xs={12} sm={4}
          />
          <FormDropdown
            label="Pond Type"
            value={form.pond_type}
            onChange={(e, val) => handleChange('pond_type', val)}
            options={POND_TYPES}
            valueKey="value"
            getOptionLabel={(opt) => opt.label || opt.value || opt}
            xs={12} sm={6}
          />
          <FormDropdown
            label="Water Source"
            value={form.water_source}
            onChange={(e, val) => handleChange('water_source', val)}
            options={FISH_WATER_SOURCES}
            valueKey="value"
            getOptionLabel={(opt) => opt.label || opt.value || opt}
            xs={12} sm={6}
          />
        </Grid>
      </FormSection>

      <FormSection title="Dimensions & Equipment" subtitle="Pond size and installed systems">
        <Grid container spacing={3}>
          <FormField
            label="Area"
            type="number"
            value={form.area_sqm}
            onChange={(e) => handleChange('area_sqm', e.target.value)}
            unit="m²"
            xs={12} sm={6}
          />
          <FormField
            label="Depth"
            type="number"
            value={form.depth_m}
            onChange={(e) => handleChange('depth_m', e.target.value)}
            unit="m"
            xs={12} sm={6}
          />
          <FormField
            label="Aeration System"
            type="checkbox"
            checked={form.aeration_system}
            onChange={(e) => handleChange('aeration_system', e.target.checked)}
            xs={6}
          />
          <FormField
            label="Filtration System"
            type="checkbox"
            checked={form.filtration_system}
            onChange={(e) => handleChange('filtration_system', e.target.checked)}
            xs={6}
          />
        </Grid>
      </FormSection>

      <FormSection title="Additional Notes">
        <FormField
          label="Description"
          multiline
          rows={3}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          xs={12}
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
