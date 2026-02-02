import React, { useState, useEffect, useRef } from 'react';
import {
  CircularProgress,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  FormContainer,
  FormSection,
  FormField,
  FormDropdown,
  FormActions
} from '../../common/forms';
import { getPondOptions, getFishOptions } from '../../../utils/options';
import userUtil from '../../../utils/user';
import { useAlert } from '../../common';

/**
 * SamplingForm - Standardized sampling entry form
 */
export default function SamplingForm({ initialData = {}, onSubmit, onCancel, users = [] }) {
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    pond_id: initialData.pond_id || null, // Store as object/instance
    species: initialData.species || null, // Store as object/instance
    sampling_count: initialData.sampling_count ?? 5,
    total_count: initialData.total_count ?? 100,
    avg_weight: initialData.avg_weight ?? 1000,
    notes: initialData.notes || '',
    sample_date: initialData.sample_date || initialData.sampling_date || new Date().toISOString().slice(0, 10),
    fish_cost: initialData.fish_cost ?? 50,
    total_amount: initialData.total_amount || 0,
    cost_enabled: (initialData.cost_enabled === undefined) ? true : Boolean(initialData.cost_enabled),
    recorded_by_userKey: initialData.recorded_by_userKey || '',
  });

  const [manualTotal, setManualTotal] = useState(initialData.manual_total ?? false);
  const [pondOptions, setPondOptions] = useState([]);
  const [fishOptions, setFishOptions] = useState([]);
  const [loadingPonds, setLoadingPonds] = useState(false);
  const [loadingFish, setLoadingFish] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [localUsers, setLocalUsers] = useState(Array.isArray(users) ? users : []);
  const mountedRef = useRef(true);

  // Load options on mount
  useEffect(() => {
    mountedRef.current = true;
    loadOptions();
    loadUsers();
    return () => { mountedRef.current = false; };
  }, []);

  const loadOptions = async () => {
    setLoadingPonds(true);
    setLoadingFish(true);
    try {
      const [p, f] = await Promise.all([
        getPondOptions({ force: false }),
        getFishOptions({ force: false })
      ]);

      if (!mountedRef.current) return;

      setPondOptions(p || []);
      setFishOptions(f || []);

      // Defaults
      setForm(prev => {
        let next = { ...prev };
        if (!prev.species && f?.length > 0) next.species = f[0];
        if (!prev.pond_id && p?.length > 0) next.pond_id = p[0];
        return next;
      });
    } catch (e) {
      console.warn('Failed to load options', e);
    } finally {
      if (mountedRef.current) {
        setLoadingPonds(false);
        setLoadingFish(false);
      }
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const u = await userUtil.fetchUsers();
      if (!mountedRef.current) return;
      setLocalUsers(u || []);

      // Auto-select current user if none
      if (!form.recorded_by_userKey) {
        const cur = await userUtil.getCurrentUser();
        if (cur && mountedRef.current) {
          const key = cur.user_key || cur.userKey || cur.id;
          setForm(prev => ({ ...prev, recorded_by_userKey: key }));
        }
      }
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      if (mountedRef.current) setLoadingUsers(false);
    }
  };

  // Calculations
  useEffect(() => {
    if (form.cost_enabled && !manualTotal) {
      const weightKg = Math.max(Number(form.avg_weight) / 1000, 1);
      const total = (Number(form.total_count) * weightKg * Number(form.fish_cost)).toFixed(2);
      setForm(prev => ({ ...prev, total_amount: Number(total) }));
    }
  }, [form.total_count, form.avg_weight, form.fish_cost, form.cost_enabled, manualTotal]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'total_amount') setManualTotal(true);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Mapping to API format
    const payload = {
      pond_id: form.pond_id?.id || form.pond_id?.pond_id || form.pond_id,
      species_id: form.species?.id || form.species?.species_id || form.species?.fish_id || (typeof form.species === 'string' ? form.species : null),
      sampling_count: Number(form.sampling_count),
      total_count: Number(form.total_count),
      avg_weight_g: Number(form.avg_weight),
      sample_date: form.sample_date,
      notes: form.notes,
      fish_cost: Number(form.fish_cost),
      total_amount: Number(form.total_amount),
      cost_enabled: Boolean(form.cost_enabled),
      recorded_by: form.recorded_by_userKey,
    };

    if (onSubmit) onSubmit(payload);
  };

  return (
    <FormContainer
      title="New Pond Sampling"
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      <Grid container spacing={3}>
        <FormSection title="Source & Location" subtitle="Select the pond and species">
          <FormDropdown
            label="Pond"
            value={form.pond_id}
            onChange={(e, val) => handleChange('pond_id', val)}
            options={pondOptions}
            getOptionLabel={(opt) => opt.label || opt.name || 'Unnamed Pond'}
            loading={loadingPonds}
            onRefresh={loadOptions}
            required
            xs={12} sm={6}
          />

          <FormDropdown
            label="Species"
            value={form.species}
            onChange={(e, val) => handleChange('species', val)}
            options={fishOptions}
            getOptionLabel={(opt) => opt.label || opt.common_name || (typeof opt === 'string' ? opt : 'Unnamed Species')}
            loading={loadingFish}
            onRefresh={loadOptions}
            freeSolo
            required
            xs={12} sm={6}
          />

          <FormDropdown
            label="Recorded By"
            value={localUsers.find(u => (u.user_key === form.recorded_by_userKey || u.id === form.recorded_by_userKey)) || form.recorded_by_userKey}
            onChange={(e, val) => handleChange('recorded_by_userKey', val?.user_key || val?.id || val)}
            options={localUsers}
            getOptionLabel={(u) => u.display_name || u.username || u.name || (typeof u === 'string' ? u : '')}
            loading={loadingUsers}
            required
            xs={12} sm={6}
          />

          <FormField
            label="Sample Date"
            type="date"
            value={form.sample_date}
            onChange={(e) => handleChange('sample_date', e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
            xs={12} sm={6}
          />
        </FormSection>

        <FormSection title="Measurements" subtitle="Fish count and weights">
          <FormField
            label="Sampling Count"
            type="number"
            value={form.sampling_count}
            onChange={(e) => handleChange('sampling_count', e.target.value)}
            helperText="Number of fish actually caught for weighing"
            xs={12} sm={4}
          />
          <FormField
            label="Avg. Weight"
            type="number"
            value={form.avg_weight}
            onChange={(e) => handleChange('avg_weight', e.target.value)}
            unit="g"
            xs={12} sm={4}
          />
          <FormField
            label="Total Count"
            type="number"
            value={form.total_count}
            onChange={(e) => handleChange('total_count', e.target.value)}
            helperText="Estimate of total fish in pond"
            xs={12} sm={4}
          />
        </FormSection>

        <FormSection title="Financials" subtitle="Cost calculation for stocking">
          <FormField
            label="Cost Calculation"
            type="checkbox"
            checked={form.cost_enabled}
            onChange={(e) => handleChange('cost_enabled', e.target.checked)}
            labelPlacement="end"
            checkboxLabel="Enable Cost Auto-Calculation"
            xs={12}
          />
          <FormField
            label="Fish Cost"
            type="number"
            value={form.fish_cost}
            onChange={(e) => handleChange('fish_cost', e.target.value)}
            disabled={!form.cost_enabled}
            unit="₹/kg"
            xs={12} sm={6}
          />
          <FormField
            label="Total Amount"
            type="number"
            value={form.total_amount}
            onChange={(e) => handleChange('total_amount', e.target.value)}
            unit="₹"
            xs={12} sm={6}
          />
        </FormSection>

        <FormSection title="Additional Notes">
          <FormField
            label="Notes"
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            multiline
            rows={3}
            xs={12}
          />
        </FormSection>

        <FormActions
          onCancel={onCancel}
          submitText="Save Sampling"
          loading={false}
        />
      </Grid>
    </FormContainer>
  );
}
