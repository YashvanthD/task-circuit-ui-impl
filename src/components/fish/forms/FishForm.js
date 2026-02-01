/**
 * FishForm Component
 * Form for adding/editing fish using reusable form components
 *
 * @module components/fish/forms/FishForm
 */

import React, { useState, useEffect } from 'react';
import { Grid, Button, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import {
  FormContainer,
  FormSection,
  FormField,
  FormDropdown,
  FormKeyValue,
  FormActions
} from '../../common/forms';

import { Fish } from '../../../models';
import { fetchPonds } from '../../../services';

/**
 * FishForm - Clean form using reusable components
 *
 * @param {Object} props
 * @param {Object} props.initialData - Initial form data (Fish model or raw data)
 * @param {Function} props.onSubmit - Submit callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {boolean} props.loading - Loading state
 * @param {string} props.mode - 'add' or 'edit'
 */
export default function FishForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  mode = 'add',
}) {
  const isEdit = mode === 'edit';

  // Initialize form with default data or initial data
  const [form, setForm] = useState(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // If editing, convert Fish model/API data to form format
      const fish = new Fish(initialData);
      return {
        common_name: fish.common_name || '',
        scientific_name: fish.scientific_name || '',
        local_name: fish.local_name || '',
        count: fish.count || '',
        average_weight: fish.average_weight || '',
        min_weight: fish.min_weight || '',
        max_weight: fish.max_weight || '',
        ponds: fish.ponds || [],
        capture_date: fish.capture_date || '',
        stock_date: fish.stock_date || '',
        status: fish.status || 'active',
        source: fish.source || '',
        notes: fish.notes || '',
        price_per_kg: fish.price_per_kg || '',
        custom_fields: fish.custom_fields || {}
      };
    }
    // If adding new, use default form data
    return Fish.getDefaultFormData();
  });

  // Ponds state
  const [ponds, setPonds] = useState([]);
  const [loadingPonds, setLoadingPonds] = useState(false);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Status options
  const statusOptions = ['active', 'inactive', 'harvested', 'sold'];

  // Load ponds
  useEffect(() => {
    loadPonds();
  }, []);

  const loadPonds = async () => {
    setLoadingPonds(true);
    try {
      const pondsList = await fetchPonds();
      setPonds(pondsList);
    } catch (error) {
      console.error('[FishForm] Failed to load ponds:', error);
    } finally {
      setLoadingPonds(false);
    }
  };

  // Handle field change
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle submit
  const handleSubmit = () => {
    // Create Fish model from form data
    const fish = Fish.fromFormData(form);

    // Validate
    if (!fish.isValid()) {
      console.error('[FishForm] Validation errors:', fish.errors);
      // TODO: Show validation errors to user
      return;
    }

    // Submit API payload
    if (onSubmit) {
      onSubmit(fish.toAPIPayload());
    }
  };

  return (
    <FormContainer
      title={isEdit ? 'Edit Fish' : 'Add New Fish'}
      onSubmit={handleSubmit}
    >
      <Grid container spacing={3}>
        {/* Basic Information */}
        <FormSection
          title="Basic Information"
          subtitle="Enter the fish species details"
        >
          <FormField
            label="Common Name"
            value={form.common_name}
            onChange={(e) => handleChange('common_name', e.target.value)}
            required
            placeholder="e.g., Tilapia"
            helperText="Primary name for this fish species"
            xs={12} sm={6}
          />

          <FormField
            label="Scientific Name"
            value={form.scientific_name}
            onChange={(e) => handleChange('scientific_name', e.target.value)}
            placeholder="e.g., Oreochromis niloticus"
            helperText="Optional scientific classification"
            xs={12} sm={6}
          />

          <FormField
            label="Local Name"
            value={form.local_name}
            onChange={(e) => handleChange('local_name', e.target.value)}
            placeholder="Local/regional name"
            xs={12} sm={6}
          />

          <FormDropdown
            label="Status"
            value={form.status}
            onChange={(e, val) => handleChange('status', val || 'active')}
            options={statusOptions}
            required
            xs={12} sm={6}
          />
        </FormSection>

        {/* Quantity & Measurements */}
        <FormSection
          title="Quantity & Measurements"
          subtitle="Fish count and weight details"
        >
          <FormField
            label="Total Count"
            type="number"
            value={form.count}
            onChange={(e) => handleChange('count', e.target.value)}
            unit="fish"
            inputProps={{ min: 0 }}
            xs={12} sm={6} md={3}
          />

          <FormField
            label="Average Weight"
            type="number"
            value={form.average_weight}
            onChange={(e) => handleChange('average_weight', e.target.value)}
            unit="g"
            inputProps={{ min: 0, step: 0.1 }}
            xs={12} sm={6} md={3}
          />

          <FormField
            label="Min Weight"
            type="number"
            value={form.min_weight}
            onChange={(e) => handleChange('min_weight', e.target.value)}
            unit="g"
            inputProps={{ min: 0, step: 0.1 }}
            xs={12} sm={6} md={3}
          />

          <FormField
            label="Max Weight"
            type="number"
            value={form.max_weight}
            onChange={(e) => handleChange('max_weight', e.target.value)}
            unit="g"
            inputProps={{ min: 0, step: 0.1 }}
            xs={12} sm={6} md={3}
          />
        </FormSection>

        {/* Location */}
        <FormSection
          title="Location"
          subtitle="Select ponds where this fish is located"
        >
          <FormDropdown
            label="Ponds"
            value={form.ponds}
            onChange={(e, val) => handleChange('ponds', val)}
            options={ponds}
            getOptionLabel={(opt) => opt.name || opt.pond_id || 'Unnamed Pond'}
            multiple
            loading={loadingPonds}
            onRefresh={loadPonds}
            helperText="Select one or more ponds"
            xs={12}
          />
        </FormSection>

        {/* Advanced Options (Collapsible) */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Collapse in={showAdvanced}>
            <Grid container spacing={3}>
              {/* Dates Section */}
              <FormSection title="Dates" divider={false}>
                <FormField
                  label="Capture Date"
                  type="date"
                  value={form.capture_date}
                  onChange={(e) => handleChange('capture_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  xs={12} sm={6}
                />

                <FormField
                  label="Stock Date"
                  type="date"
                  value={form.stock_date}
                  onChange={(e) => handleChange('stock_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  xs={12} sm={6}
                />
              </FormSection>

              {/* Additional Information Section */}
              <FormSection title="Additional Information" divider={false}>
                <FormField
                  label="Source"
                  value={form.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  placeholder="e.g., Hatchery, Wild caught"
                  xs={12} sm={6}
                />

                <FormField
                  label="Price per kg"
                  type="number"
                  value={form.price_per_kg}
                  onChange={(e) => handleChange('price_per_kg', e.target.value)}
                  unit="₹"
                  unitPosition="start"
                  inputProps={{ min: 0, step: 0.01 }}
                  xs={12} sm={6}
                />

                <FormField
                  label="Notes"
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Additional notes or observations..."
                  xs={12}
                />
              </FormSection>

              {/* Custom Fields Section */}
              <Grid item xs={12}>
                <FormKeyValue
                  label="Custom Fields"
                  value={form.custom_fields}
                  onChange={(newFields) => handleChange('custom_fields', newFields)}
                  keyLabel="Field Name"
                  valueLabel="Field Value"
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>

        {/* Form Actions */}
        <FormActions
          submitText={isEdit ? 'Update Fish' : 'Add Fish'}
          onCancel={onCancel}
          loading={loading}
        />
      </Grid>
    </FormContainer>
  );
}
