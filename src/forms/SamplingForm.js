import React, { useState, useEffect, useRef } from 'react';
import { Paper, Typography, TextField, Stack, Button, CircularProgress, Box, InputAdornment, IconButton, Grid, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Autocomplete from '@mui/material/Autocomplete';
import { getPondOptions, getFishOptions } from '../utils/options';

export default function SamplingForm({ initialData = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    pond_id: initialData.pond_id || '',
    species: initialData.species || null,
    sampling_count: initialData.sampling_count ?? 5, // number of fish sampled (default 5)
    total_count: initialData.total_count ?? 100, // total fish to buy (default 100)
    avg_weight: initialData.avg_weight ?? 1000, // grams (default 1kg)
    notes: initialData.notes || '',
    // New fields
    fish_cost: initialData.fish_cost ?? 50, // INR per kg default 50
    total_amount: initialData.total_amount || 0, // editable lumpsum (manual override)
  });

  const [manualTotal, setManualTotal] = useState(false);
  const [pondOptions, setPondOptions] = useState([]);
  const [fishOptions, setFishOptions] = useState([]);
  const [loadingPonds, setLoadingPonds] = useState(false);
  const [loadingFish, setLoadingFish] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const mountedRef = useRef(true);

  // compute weight-per-fish in kg with minimum 1kg as per instruction
  const weightPerFishKg = () => {
    const avgGrams = Number(form.avg_weight) || 0;
    const avgKg = avgGrams / 1000;
    return Math.max(avgKg, 1);
  };

  // computed total: total_count * weightPerFishKg * fish_cost
  const computeTotal = () => {
    const totalCount = Number(form.total_count) || 0;
    const unit = Number(form.fish_cost) || 0; // cost per kg
    return Number((totalCount * weightPerFishKg() * unit).toFixed(2));
  };

  const loadOptions = async () => {
    setLoadingPonds(true);
    setLoadingFish(true);
    try {
      let [p, f] = await Promise.all([getPondOptions({ force: false }), getFishOptions({ force: false })]);
      if (!Array.isArray(p) || p.length === 0) {
        try { p = await getPondOptions({ force: true }); } catch (e) { /* ignore */ }
      }
      if (!Array.isArray(f) || f.length === 0) {
        try { f = await getFishOptions({ force: true }); } catch (e) { /* ignore */ }
      }
      if (!mountedRef.current) return;
      setPondOptions(p || []);
      setFishOptions(f || []);
      // default selection to first element if none selected (species and pond)
      setForm(prev => {
        let next = prev;
        if ((!prev.species) && Array.isArray(f) && f.length > 0) {
          next = { ...next, species: f[0] };
        }
        if ((!prev.pond_id || prev.pond_id === '') && Array.isArray(p) && p.length > 0) {
          next = { ...next, pond_id: p[0] };
        }
        // if total_amount not set (0) and not manual, set to computed
        if (!manualTotal && (!prev.total_amount || Number(prev.total_amount) === 0)) {
          next = { ...next, total_amount: computeTotal() };
        }
        return next;
      });
    } catch (e) {
      console.warn('Failed to load options', e);
    } finally {
      setLoadingPonds(false);
      setLoadingFish(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadOptions();
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Recompute total when inputs change, unless user manually overrode
    if (!manualTotal) {
      const total = computeTotal();
      setForm(prev => ({ ...prev, total_amount: total }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.total_count, form.avg_weight, form.fish_cost]);

  const handleReloadFish = async () => {
    setLoadingFish(true);
    try {
      const f = await getFishOptions({ force: true });
      if (!mountedRef.current) return;
      setFishOptions(f || []);
      setForm(prev => (!prev.species && Array.isArray(f) && f.length > 0) ? ({ ...prev, species: f[0] }) : prev);
    } catch (e) {
      console.error('Failed to reload fish options', e);
    } finally {
      setLoadingFish(false);
    }
  };

  const handleReloadPonds = async () => {
    setLoadingPonds(true);
    try {
      const p = await getPondOptions({ force: true });
      if (!mountedRef.current) return;
      setPondOptions(p || []);
      setForm(prev => ((!prev.pond_id || prev.pond_id === '') && Array.isArray(p) && p.length > 0) ? ({ ...prev, pond_id: p[0] }) : prev);
    } catch (e) {
      console.error('Failed to reload pond options', e);
    } finally {
      setLoadingPonds(false);
    }
  };

  const handleSpeciesInputChange = async (event, value) => {
    setInputValue(value);
    if (!value || value.trim() === '') return;
    const q = value.toLowerCase();
    const found = (fishOptions || []).some(o => (o.common_name || '').toLowerCase().includes(q) || (o.scientific_name || '').toLowerCase().includes(q) || (o.id || '').toString().toLowerCase().includes(q));
    if (!found) {
      // Try a force reload (public API fallback)
      try {
        setLoadingFish(true);
        const f = await getFishOptions({ force: true });
        if (!mountedRef.current) return;
        setFishOptions(f || []);
      } catch (e) {
        console.warn('Search fetch failed', e);
      } finally {
        setLoadingFish(false);
      }
    }
  };

  const handleChange = (patch) => setForm(f => ({ ...f, ...patch }));

  const handleTotalManualChange = (value) => {
    setManualTotal(true);
    setForm(prev => ({ ...prev, total_amount: value }));
  };

  const resetTotalToAuto = () => {
    const total = computeTotal();
    setManualTotal(false);
    setForm(prev => ({ ...prev, total_amount: total }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // species can be object (selected option) or string (free text)
    let speciesObj;
    if (!form.species) speciesObj = null;
    else if (typeof form.species === 'string') {
      const txt = form.species.trim();
      speciesObj = { species_id: txt, common_name: txt, scientific_name: '' };
    } else {
      speciesObj = {
        species_id: form.species.id || form.species.raw?.id || form.species.raw?.fish_id || '',
        common_name: form.species.common_name || form.species.raw?.common_name || '',
        scientific_name: form.species.scientific_name || form.species.raw?.scientific_name || '',
      };
    }

    const out = {
      pond_id: form.pond_id && typeof form.pond_id === 'object' ? (form.pond_id.id || form.pond_id.raw?.pond_id || form.pond_id.raw?.id) : form.pond_id,
      species: speciesObj,
      sampling_count: Number(form.sampling_count) || 0,
      total_count: Number(form.total_count) || 0,
      avg_weight: Number(form.avg_weight) || 0,
      notes: form.notes || '',
      fish_cost: Number(form.fish_cost) || 0,
      total_amount: Number(form.total_amount) || 0,
      manual_total: manualTotal,
    };

    if (onSubmit) onSubmit(out);
  };

  return (
    <Paper sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
      <Typography variant="h6">New Sampling</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={11}>
              <Autocomplete
                options={pondOptions}
                getOptionLabel={(opt) => opt.label || opt.id || ''}
                loading={loadingPonds}
                onChange={(e, val) => handleChange({ pond_id: val })}
                value={typeof form.pond_id === 'object' ? form.pond_id : (pondOptions.find(p => (p.id === form.pond_id || p.id === (form.pond_id && form.pond_id.id))) || null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={<><span>Pond</span> <Tooltip title="Select the pond where fish will be stocked"><InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /></Tooltip></>}
                    placeholder="Select pond"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (loadingPonds ? (<InputAdornment position="end"><CircularProgress color="inherit" size={20} /></InputAdornment>) : null),
                    }}
                    fullWidth
                    sx={{ minWidth: 320 }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton onClick={handleReloadPonds} aria-label="Reload ponds" title="Reload ponds" size="small">
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <Autocomplete
                  options={fishOptions}
                  getOptionLabel={(opt) => typeof opt === 'string' ? opt : (opt.label || opt.id || '')}
                  loading={loadingFish}
                  onChange={(e, val) => handleChange({ species: val })}
                  value={form.species}
                  freeSolo
                  onInputChange={handleSpeciesInputChange}
                  inputValue={inputValue}
                  filterOptions={(options, state) => {
                    const q = (state.inputValue || '').toLowerCase();
                    if (!q) return options;
                    return options.filter(o => (
                      (o.common_name || '').toLowerCase().includes(q) ||
                      (o.scientific_name || '').toLowerCase().includes(q) ||
                      (o.id || '').toString().toLowerCase().includes(q)
                    ));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<><span>Species (common | scientific | id)</span> <Tooltip title="Search public species list or your account species"><InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /></Tooltip></>}
                      placeholder="Search species by name or id"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (loadingFish ? (<InputAdornment position="end"><CircularProgress color="inherit" size={20} /></InputAdornment>) : null),
                      }}
                      fullWidth
                      sx={{ minWidth: 320 }}
                    />
                  )}
                  fullWidth
                />
              </Box>
              <IconButton onClick={handleReloadFish} aria-label="Reload species" title="Reload species" size="small">
                <RefreshIcon />
              </IconButton>
            </Stack>

          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField label={<>Sampling count <Tooltip title="Number of fish sampled to estimate average weight"><InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /></Tooltip></>} name="sampling_count" value={form.sampling_count} onChange={e => handleChange({ sampling_count: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label={<>Total count <Tooltip title="Total number of fish to purchase/stock"><InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /></Tooltip></>} name="total_count" value={form.total_count} onChange={e => handleChange({ total_count: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label={<>Avg weight (g) <Tooltip title="Average weight per sampled fish in grams (min 1000g used for cost calc)"><InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /></Tooltip></>} name="avg_weight" value={form.avg_weight} onChange={e => handleChange({ avg_weight: e.target.value })} fullWidth />
            </Grid>
          </Grid>

          {/* Purchase / cost section */}
          <Box>
            <Typography variant="subtitle2">Cost calculation</Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={<>Fish cost (INR per kg) <Tooltip title="Price per kilogram used to compute total cost"><InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /></Tooltip></>}
                  name="fish_cost"
                  type="number"
                  value={form.fish_cost}
                  onChange={e => handleChange({ fish_cost: e.target.value })}
                  inputProps={{ min: 0 }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">Computed total (INR)</Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>{computeTotal()}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label={<>Total amount (INR) <Tooltip title="Total payable amount; editable to override computed value"><InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /></Tooltip></>}
                  name="total_amount"
                  type="number"
                  value={form.total_amount}
                  onChange={e => handleTotalManualChange(Number(e.target.value))}
                  inputProps={{ min: 0 }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={1}>
                <IconButton onClick={resetTotalToAuto} aria-label="Reset total to auto" title="Reset total to auto" size="small">
                  <AutorenewIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>

          <TextField label="Notes" name="notes" value={form.notes} onChange={e => handleChange({ notes: e.target.value })} fullWidth multiline rows={3} />
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onCancel}>Cancel</Button>
            <Button variant="contained" type="submit">Save</Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}
