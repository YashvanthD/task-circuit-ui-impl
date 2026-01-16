/**
 * FishForm Component
 * Comprehensive form for adding/editing fish species with all fields.
 *
 * @module components/fish/forms/FishForm
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Autocomplete,
  IconButton,
  Divider,
  Chip,
  Box,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

import { getPondOptions } from '../../../utils/options';

// ============================================================================
// Main Component
// ============================================================================

/**
 * FishForm - Form for adding/editing fish
 *
 * @param {Object} props
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Submit callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {Array} props.pondOptions - Available pond options (optional, will fetch if not provided)
 * @param {string} props.mode - 'add' or 'edit'
 */
export default function FishForm({
  initialData = {},
  onSubmit,
  onCancel,
  pondOptions: externalPondOptions,
  mode = 'add',
}) {
  const isEdit = mode === 'edit';
  const mountedRef = useRef(true);

  // Form state
  const [form, setForm] = useState(() => ({
    // Basic info
    common_name: initialData.common_name || initialData.name || '',
    scientific_name: initialData.scientific_name || '',
    local_name: initialData.local_name || '',

    // Counts and measurements
    count: initialData.count || initialData.total_count || 0,
    average_weight: initialData.average_weight || initialData.avg_weight || 0,
    min_weight: initialData.min_weight || 0,
    max_weight: initialData.max_weight || 0,

    // Location
    ponds: initialData.ponds
      ? (Array.isArray(initialData.ponds) ? initialData.ponds : [initialData.ponds])
      : [],

    // Dates
    capture_date: initialData.capture_date || '',
    stock_date: initialData.stock_date || '',

    // Additional info
    status: initialData.status || 'active',
    source: initialData.source || '',
    notes: initialData.notes || '',

    // Custom fields
    custom_fields: initialData.custom_fields || {},

    // Track if selling/pricing info
    include_pricing: Boolean(initialData.price_per_kg),
    price_per_kg: initialData.price_per_kg || 0,
  }));

  // Custom fields input state
  const [newCustomField, setNewCustomField] = useState({ key: '', value: '' });

  // Pond options state
  const [pondOptions, setPondOptions] = useState(externalPondOptions || []);
  const [loadingPonds, setLoadingPonds] = useState(false);

  // Status options
  const statusOptions = ['active', 'inactive', 'harvested', 'sold'];

  useEffect(() => {
    mountedRef.current = true;
    if (!externalPondOptions) {
      loadPonds();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [externalPondOptions]);

  const loadPonds = async () => {
    setLoadingPonds(true);
    try {
      const options = await getPondOptions({ force: false });
      if (mountedRef.current) {
        setPondOptions(Array.isArray(options) ? options : []);
      }
    } catch (e) {
      console.warn('Failed to load pond options:', e);
    } finally {
      if (mountedRef.current) {
        setLoadingPonds(false);
      }
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCustomField = () => {
    if (newCustomField.key.trim()) {
      setForm((prev) => ({
        ...prev,
        custom_fields: {
          ...prev.custom_fields,
          [newCustomField.key.trim()]: newCustomField.value,
        },
      }));
      setNewCustomField({ key: '', value: '' });
    }
  };

  const handleRemoveCustomField = (key) => {
    setForm((prev) => {
      const { [key]: removed, ...rest } = prev.custom_fields;
      return { ...prev, custom_fields: rest };
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    // Normalize ponds to IDs
    const pondIds = form.ponds.map((p) =>
      typeof p === 'object' ? p.id || p.pond_id : p
    );

    const payload = {
      ...form,
      ponds: pondIds,
      count: Number(form.count) || 0,
      average_weight: Number(form.average_weight) || 0,
      min_weight: Number(form.min_weight) || 0,
      max_weight: Number(form.max_weight) || 0,
      price_per_kg: form.include_pricing ? Number(form.price_per_kg) || 0 : null,
    };

    // Remove temporary fields
    delete payload.include_pricing;

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Basic Information
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Common Name"
            value={form.common_name}
            onChange={(e) => handleChange('common_name', e.target.value)}
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Scientific Name"
            value={form.scientific_name}
            onChange={(e) => handleChange('scientific_name', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Local Name"
            value={form.local_name}
            onChange={(e) => handleChange('local_name', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={statusOptions}
            value={form.status}
            onChange={(e, val) => handleChange('status', val || 'active')}
            renderInput={(params) => (
              <TextField {...params} label="Status" fullWidth />
            )}
          />
        </Grid>

        {/* Counts and Measurements */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            Counts & Measurements
          </Typography>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            label="Count"
            type="number"
            value={form.count}
            onChange={(e) => handleChange('count', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            label="Average Weight (g)"
            type="number"
            value={form.average_weight}
            onChange={(e) => handleChange('average_weight', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            label="Min Weight (g)"
            type="number"
            value={form.min_weight}
            onChange={(e) => handleChange('min_weight', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            label="Max Weight (g)"
            type="number"
            value={form.max_weight}
            onChange={(e) => handleChange('max_weight', e.target.value)}
            fullWidth
          />
        </Grid>

        {/* Location */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            Location
          </Typography>
        </Grid>

        <Grid item xs={11}>
          <Autocomplete
            multiple
            options={pondOptions}
            getOptionLabel={(opt) => opt.label || opt.id || String(opt)}
            value={form.ponds.map((p) =>
              pondOptions.find((o) => o.id === p || o.id === p?.id) || { id: p, label: String(p) }
            )}
            onChange={(e, val) => handleChange('ponds', val)}
            loading={loadingPonds}
            renderInput={(params) => (
              <TextField {...params} label="Ponds" fullWidth />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.label || option.id}
                  size="small"
                  {...getTagProps({ index })}
                  key={option.id || index}
                />
              ))
            }
          />
        </Grid>

        <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => loadPonds()} title="Refresh ponds">
            <RefreshIcon />
          </IconButton>
        </Grid>

        {/* Dates */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            Dates
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Capture Date"
            type="date"
            value={form.capture_date}
            onChange={(e) => handleChange('capture_date', e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Stock Date"
            type="date"
            value={form.stock_date}
            onChange={(e) => handleChange('stock_date', e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Additional Info */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            Additional Information
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Source"
            value={form.source}
            onChange={(e) => handleChange('source', e.target.value)}
            fullWidth
            placeholder="e.g., Hatchery, Wild caught"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={form.include_pricing}
                onChange={(e) => handleChange('include_pricing', e.target.checked)}
              />
            }
            label="Include pricing"
          />
          {form.include_pricing && (
            <TextField
              label="Price per kg"
              type="number"
              value={form.price_per_kg}
              onChange={(e) => handleChange('price_per_kg', e.target.value)}
              fullWidth
              sx={{ mt: 1 }}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </Grid>

        {/* Custom Fields */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            Custom Fields
          </Typography>
        </Grid>

        {Object.entries(form.custom_fields).map(([key, value]) => (
          <Grid item xs={12} key={key}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Field"
                value={key}
                disabled
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Value"
                value={value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    custom_fields: { ...prev.custom_fields, [key]: e.target.value },
                  }))
                }
                size="small"
                sx={{ flex: 2 }}
              />
              <IconButton
                onClick={() => handleRemoveCustomField(key)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="New Field Name"
              value={newCustomField.key}
              onChange={(e) => setNewCustomField((prev) => ({ ...prev, key: e.target.value }))}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Value"
              value={newCustomField.value}
              onChange={(e) => setNewCustomField((prev) => ({ ...prev, value: e.target.value }))}
              size="small"
              sx={{ flex: 2 }}
            />
            <IconButton
              onClick={handleAddCustomField}
              color="primary"
              disabled={!newCustomField.key.trim()}
            >
              <AddIcon />
            </IconButton>
          </Stack>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              {isEdit ? 'Update' : 'Add'} Fish
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

