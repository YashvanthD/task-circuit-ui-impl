/**
 * StockForm Component
 * Form for creating fish stocks (stocking fish in ponds)
 * Uses reusable form components
 *
 * @module components/stock/forms/StockForm
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Grid } from '@mui/material';

import {
  FormContainer,
  FormSection,
  FormField,
  FormDropdown,
  FormActions
} from '../../common/forms';

import { fetchPonds } from '../../../services/pondService';
import { fetchFish } from '../../../services/fishService';
import { Pond, Fish } from '../../../models';

/**
 * StockForm - Form for adding fish stock to ponds
 *
 * @param {Object} props
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Submit callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {boolean} props.loading - Loading state
 * @param {string} props.mode - 'add' or 'edit'
 */
export default function StockForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  mode = 'add',
}) {
  const isEdit = mode === 'edit';

  // Initialize form state
  const [form, setForm] = useState({
    pond_id: initialData.pond_id || null, // Store as object, not string
    species_id: initialData.species_id || null, // Store as object, not string
    farm_id: initialData.farm_id || null, // Store farm_id
    initial_count: initialData.initial_count || '',
    initial_avg_weight_g: initialData.initial_avg_weight_g || '',
    stocking_date: initialData.stocking_date || new Date().toISOString().split('T')[0],
    source: initialData.source || '',
    source_contact: initialData.source_contact || '',
    cost_per_unit: initialData.cost_per_unit || '',
    total_cost: initialData.total_cost || '',
    batch_number: initialData.batch_number || '',
    notes: initialData.notes || '',
  });

  // Ponds and species state
  const [ponds, setPonds] = useState([]);
  const [species, setSpecies] = useState([]);
  const [loadingPonds, setLoadingPonds] = useState(false);
  const [loadingSpecies, setLoadingSpecies] = useState(false);

  const loadPonds = useCallback(async () => {
    setLoadingPonds(true);
    try {
      const pondsList = await fetchPonds();

      // Convert to dropdown options with custom labeling
      // toDropdownOptions now handles both plain objects and model instances
      const pondOptions = Pond.toDropdownOptions(pondsList, {
        showId: true,
        showType: true,
        delimiter: ' | '
      });

      setPonds(pondOptions);

      // If we have an initial pond_id (string), find and set the object
      if (initialData.pond_id && typeof initialData.pond_id === 'string') {
        const pondObj = pondOptions.find(p => p.pond_id === initialData.pond_id || p.id === initialData.pond_id);
        if (pondObj) {
          setForm(prev => ({ ...prev, pond_id: pondObj }));
        }
      }

      // Auto-select first pond if none selected
      if (!form.pond_id && pondOptions.length > 0) {
        setForm(prev => ({ ...prev, pond_id: pondOptions[0] }));
      }
    } catch (error) {
      console.error('[StockForm] Failed to load ponds:', error);
    } finally {
      setLoadingPonds(false);
    }
  }, [initialData.pond_id, form.pond_id]);

  const loadSpecies = useCallback(async () => {
    setLoadingSpecies(true);
    try {
      const speciesList = await fetchFish();

      // Convert to dropdown options with custom labeling
      // toDropdownOptions now handles both plain objects and model instances
      const speciesOptions = Fish.toDropdownOptions(speciesList, {
        showScientific: true,
        showCategory: false,
        delimiter: ' | '
      });

      setSpecies(speciesOptions);

      // If we have an initial species_id (string), find and set the object
      if (initialData.species_id && typeof initialData.species_id === 'string') {
        const speciesObj = speciesOptions.find(s => s.species_id === initialData.species_id || s.id === initialData.species_id);
        if (speciesObj) {
          setForm(prev => ({ ...prev, species_id: speciesObj }));
        }
      }

      // Auto-select first species if none selected
      if (!form.species_id && speciesOptions.length > 0) {
        setForm(prev => ({ ...prev, species_id: speciesOptions[0] }));
      }
    } catch (error) {
      console.error('[StockForm] Failed to load species:', error);
    } finally {
      setLoadingSpecies(false);
    }
  }, [initialData.species_id, form.species_id]);

  // Load ponds and species on mount
  useEffect(() => {
    loadPonds();
    loadSpecies();
  }, [loadPonds, loadSpecies]);

  // Handle field change
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // When pond is selected, auto-populate farm_id from pond's raw data
    if (field === 'pond_id' && value && typeof value === 'object') {
      const farmId = value.raw?.farm_id || value.raw?.farmId || value.farm_id || value.farmId;
      if (farmId) {
        setForm(prev => ({ ...prev, farm_id: farmId }));
      }
    }

    // Auto-calculate total cost when count or cost_per_unit changes
    if (field === 'initial_count' || field === 'cost_per_unit') {
      const count = field === 'initial_count' ? value : form.initial_count;
      const costPerUnit = field === 'cost_per_unit' ? value : form.cost_per_unit;

      if (count && costPerUnit) {
        const totalCost = Number(count) * Number(costPerUnit);
        setForm(prev => ({ ...prev, total_cost: totalCost.toFixed(2) }));
      }
    }
  };

  // Handle submit
  const handleSubmit = () => {
    // Extract pond_id from object or string
    let pondId = null;
    if (form.pond_id) {
      if (typeof form.pond_id === 'object') {
        // Try multiple ways to get the ID from the object
        pondId = form.pond_id.pond_id || form.pond_id.id || form.pond_id.raw?.pond_id || form.pond_id.raw?.id;
      } else {
        pondId = form.pond_id;
      }
    }

    // Extract species_id from object or string
    let speciesId = null;
    if (form.species_id) {
      if (typeof form.species_id === 'object') {
        // Try multiple ways to get the ID from the object
        speciesId = form.species_id.species_id || form.species_id.id || form.species_id.raw?.species_id || form.species_id.raw?.id || form.species_id.raw?.fish_id;
      } else {
        speciesId = form.species_id;
      }
    }

    // Extract farm_id
    let farmId = form.farm_id;
    if (!farmId && form.pond_id && typeof form.pond_id === 'object') {
      // Try to get farm_id from pond object if not already set
      farmId = form.pond_id.raw?.farm_id || form.pond_id.raw?.farmId || form.pond_id.farm_id || form.pond_id.farmId;
    }

    // Basic validation
    if (!pondId) {
      alert('Please select a pond');
      return;
    }
    if (!speciesId) {
      alert('Please select a species');
      return;
    }
    if (!farmId) {
      alert('Farm ID is required. Please ensure the selected pond has a farm.');
      return;
    }
    if (!form.initial_count || form.initial_count <= 0) {
      alert('Please enter a valid fish count');
      return;
    }
    if (!form.stocking_date) {
      alert('Please select a stocking date');
      return;
    }

    // Convert to API format - SNAKE_CASE ONLY (backend requirement)
    const payload = {
      pond_id: pondId,
      farm_id: farmId,
      species_id: speciesId,
      initial_count: Number(form.initial_count),
      initial_avg_weight_g: form.initial_avg_weight_g ? Number(form.initial_avg_weight_g) : undefined,
      stocking_date: form.stocking_date,
      source: form.source || undefined,
      source_contact: form.source_contact || undefined,
      cost_per_unit: form.cost_per_unit ? Number(form.cost_per_unit) : undefined,
      total_cost: form.total_cost ? Number(form.total_cost) : undefined,
      batch_number: form.batch_number || undefined,
      notes: form.notes || undefined,
    };

    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key];
    });

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <FormContainer
      title={isEdit ? 'Edit Stock' : 'Add New Stock'}
      onSubmit={handleSubmit}
    >
      <Grid container spacing={3}>
        {/* Basic Information */}
        <FormSection
          title="Basic Information"
          subtitle="Select pond and fish species for stocking"
        >
          <FormDropdown
            label="Pond"
            value={form.pond_id}
            onChange={(e, val) => handleChange('pond_id', val)}
            options={ponds}
            getOptionLabel={(opt) => opt.label || opt.name || 'Unnamed Pond'}
            loading={loadingPonds}
            onRefresh={loadPonds}
            required
            helperText="Select the pond to stock"
            xs={12} sm={6}
          />

          <FormDropdown
            label="Fish Species"
            value={form.species_id}
            onChange={(e, val) => handleChange('species_id', val)}
            options={species}
            getOptionLabel={(opt) => opt.label || opt.common_name || 'Unnamed Species'}
            loading={loadingSpecies}
            onRefresh={loadSpecies}
            required
            helperText="Select the fish species"
            xs={12} sm={6}
          />

          <FormField
            label="Stocking Date"
            type="date"
            value={form.stocking_date}
            onChange={(e) => handleChange('stocking_date', e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
            xs={12} sm={6}
          />

          <FormField
            label="Batch Number"
            value={form.batch_number}
            onChange={(e) => handleChange('batch_number', e.target.value)}
            placeholder="e.g., BATCH-2026-001"
            helperText="Optional batch identifier"
            xs={12} sm={6}
          />
        </FormSection>

        {/* Quantity & Measurements */}
        <FormSection
          title="Quantity & Measurements"
          subtitle="Fish count and weight details"
        >
          <FormField
            label="Initial Fish Count"
            type="number"
            value={form.initial_count}
            onChange={(e) => handleChange('initial_count', e.target.value)}
            unit="fish"
            required
            inputProps={{ min: 1 }}
            helperText="Number of fish being stocked"
            xs={12} sm={6}
          />

          <FormField
            label="Average Weight"
            type="number"
            value={form.initial_avg_weight_g}
            onChange={(e) => handleChange('initial_avg_weight_g', e.target.value)}
            unit="g"
            inputProps={{ min: 0, step: 0.1 }}
            helperText="Average weight per fish"
            xs={12} sm={6}
          />
        </FormSection>

        {/* Source Information */}
        <FormSection
          title="Source Information"
          subtitle="Where the fish are coming from"
        >
          <FormField
            label="Source"
            value={form.source}
            onChange={(e) => handleChange('source', e.target.value)}
            placeholder="e.g., ABC Hatchery"
            helperText="Name of hatchery or supplier"
            xs={12} sm={6}
          />

          <FormField
            label="Source Contact"
            value={form.source_contact}
            onChange={(e) => handleChange('source_contact', e.target.value)}
            placeholder="e.g., 9876543210"
            helperText="Contact number of supplier"
            xs={12} sm={6}
          />
        </FormSection>

        {/* Cost Information */}
        <FormSection
          title="Cost Information"
          subtitle="Purchase cost details"
        >
          <FormField
            label="Cost Per Unit"
            type="number"
            value={form.cost_per_unit}
            onChange={(e) => handleChange('cost_per_unit', e.target.value)}
            unit="₹"
            unitPosition="start"
            inputProps={{ min: 0, step: 0.01 }}
            helperText="Price per fish"
            xs={12} sm={4}
          />

          <FormField
            label="Total Cost"
            type="number"
            value={form.total_cost}
            onChange={(e) => handleChange('total_cost', e.target.value)}
            unit="₹"
            unitPosition="start"
            inputProps={{ min: 0, step: 0.01 }}
            helperText="Total purchase cost (auto-calculated)"
            xs={12} sm={8}
          />
        </FormSection>

        {/* Additional Notes */}
        <FormSection
          title="Additional Information"
          subtitle="Notes and observations"
        >
          <FormField
            label="Notes"
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            multiline
            rows={3}
            placeholder="e.g., Healthy fingerlings from ABC Hatchery"
            xs={12}
          />
        </FormSection>

        {/* Form Actions */}
        <FormActions
          submitText={isEdit ? 'Update Stock' : 'Add Stock'}
          onCancel={onCancel}
          loading={loading}
        />
      </Grid>
    </FormContainer>
  );
}
