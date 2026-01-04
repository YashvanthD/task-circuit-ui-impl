import React, { useEffect, useState, useRef } from 'react';
import { Paper, Typography, Grid, TextField, Button, Stack, Autocomplete, IconButton, Tooltip, InputAdornment } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getPondOptions, getFishOptions } from '../utils/options';
import Switch from '@mui/material/Switch';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function TransformForm({ initialData = {}, onSubmit, onCancel }) {
  const mountedRef = useRef(true);
  const [pondOptions, setPondOptions] = useState([]);
  const [fishOptions, setFishOptions] = useState([]);
  const [loadingPonds, setLoadingPonds] = useState(false);
  const [loadingFish, setLoadingFish] = useState(false);
  const [manualAmount, setManualAmount] = useState(false);

  // form state
  const [form, setForm] = useState(() => ({
    fromPond: initialData.fromPond || '',
    toPond: initialData.toPond || '',
    // fishes: array of { species, count, avgWeight }
    fishes: initialData.fishes && Array.isArray(initialData.fishes) ? initialData.fishes.map(f => ({ species: f.species || '', count: f.count || 0, avgWeight: f.avgWeight || 1000 })) : [{ species: initialData.species || '', count: initialData.count ?? 0, avgWeight: initialData.avgWeight ?? 1000 }],
    // defaults
    // when selling
    pricePerKg: initialData.pricePerKg ?? 0,
    totalAmount: initialData.totalAmount ?? 0,
    transfer: initialData.transfer !== undefined ? Boolean(initialData.transfer) : true, // true = move between ponds, false = sell
    notes: initialData.notes || '',
  }));

  const fieldSx = { minWidth: 220 };

  useEffect(() => {
    mountedRef.current = true;
    loadPonds();
    loadFishOptions();
    return () => { mountedRef.current = false; };
  }, []);

  const loadPonds = async () => {
    setLoadingPonds(true);
    try {
      const p = await getPondOptions({ force: false });
      if (!mountedRef.current) return;
      setPondOptions(Array.isArray(p) ? p : []);
      // set defaults if not provided
      setForm(prev => {
        let next = { ...prev };
        if ((!prev.fromPond || prev.fromPond === '') && Array.isArray(p) && p.length > 0) {
          next.fromPond = p[0];
        }
        if ((!prev.toPond || prev.toPond === '') && Array.isArray(p) && p.length > 1) {
          next.toPond = p[1];
        }
        return next;
      });
    } catch (e) {
      console.warn('Failed to load ponds', e);
    } finally {
      setLoadingPonds(false);
    }
  };

  const loadFishOptions = async () => {
    setLoadingFish(true);
    try {
      const f = await getFishOptions({ force: false });
      if (!mountedRef.current) return;
      setFishOptions(Array.isArray(f) ? f : []);
    } catch (e) {
      console.warn('Failed to load fish options', e);
    } finally {
      setLoadingFish(false);
    }
  };

  const handleChange = (patch) => setForm(f => ({ ...f, ...patch }));

  // helpers for fishes list
  const updateFishAt = (idx, patch) => setForm(f => ({ ...f, fishes: f.fishes.map((row, i) => i === idx ? { ...row, ...patch } : row) }));
  const addFishRow = () => setForm(f => ({ ...f, fishes: [ ...f.fishes, { species: '', count: 0, avgWeight: f.fishes.length > 0 ? (f.fishes[0].avgWeight || 1000) : 1000 } ] }));
  const removeFishAt = (idx) => setForm(f => ({ ...f, fishes: f.fishes.filter((_, i) => i !== idx) }));

  const totalCount = () => (form.fishes || []).reduce((s, r) => s + (Number(r.count) || 0), 0);

  // compute amount when selling: sum over species (count * (avgWeight g -> kg) * pricePerKg)
  const computeAmount = () => {
    const price = Number(form.pricePerKg) || 0;
    const sum = (form.fishes || []).reduce((s, r) => {
      const cnt = Number(r.count) || 0;
      const avgKg = ((Number(r.avgWeight) || 0) / 1000) || 0;
      return s + cnt * avgKg * price;
    }, 0);
    return Number(isFinite(sum) ? sum.toFixed(2) : 0);
  };

  useEffect(() => {
    // auto update amount when selling and not manually overridden
    if (!form.transfer) {
      if (!manualAmount) {
        const amt = computeAmount();
        setForm(f => ({ ...f, totalAmount: amt }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.fishes, form.pricePerKg, form.transfer, manualAmount]);

  const handleReloadPonds = async () => {
    await loadPonds();
  };

  const handleSubmit = (e) => {
    e && e.preventDefault && e.preventDefault();
    // normalize ponds to ids
    const from = typeof form.fromPond === 'object' ? (form.fromPond.id || form.fromPond.raw?.id || '') : form.fromPond;
    const to = typeof form.toPond === 'object' ? (form.toPond.id || form.toPond.raw?.id || '') : form.toPond;

    // normalize fishes: ensure we include speciesId and label for display
    const fishesNorm = (form.fishes || []).map(f => {
      const speciesObj = typeof f.species === 'object' && f.species ? f.species : (typeof f.species === 'string' ? { id: f.species, label: f.species } : null);
      const speciesId = speciesObj ? (speciesObj.id || speciesObj.raw?.id || speciesObj.speciesId || '') : '';
      const speciesLabel = speciesObj ? (speciesObj.label || speciesObj.common_name || speciesObj.name || speciesObj.id || '') : '';
      return { speciesId, speciesLabel, count: Number(f.count) || 0, avgWeight: Number(f.avgWeight) || 0 };
    });

    const payload = {
      eventType: form.transfer ? 'move' : 'sell',
      fromPond: from,
      toPond: form.transfer ? to : null,
      fishes: fishesNorm,
      count: totalCount(),
      avgWeight: null, // per-species avg is included in fishes
      pricePerKg: form.transfer ? null : Number(form.pricePerKg) || 0,
      totalAmount: Number(form.totalAmount) || 0,
      notes: form.notes || '',
      manualAmount: Boolean(manualAmount),
    };
    if (onSubmit) onSubmit(payload);
  };

  return (
    <Paper sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
      <Typography variant="h6">Transform Fish</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mt: 1 }}>

          <Grid item xs={11} sx={{ display: 'flex', alignItems: 'center' }}>
            <Autocomplete
              options={pondOptions}
              getOptionLabel={(opt) => opt.label || opt.id || ''}
              loading={loadingPonds}
              onChange={(e, val) => handleChange({ fromPond: val })}
              value={typeof form.fromPond === 'object' ? form.fromPond : (pondOptions.find(p => (p.id === form.fromPond || p.id === (form.fromPond && form.fromPond.id))) || null)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={<><span>From Pond</span> <Tooltip title="Source pond"><InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /></Tooltip></>}
                  placeholder="Select source pond"
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

          {/* Fish rows - allow multiple species */}
          {(form.fishes || []).map((row, idx) => (
            <React.Fragment key={idx}>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={fishOptions}
                  getOptionLabel={(opt) => typeof opt === 'string' ? opt : (opt.label || opt.id || '')}
                  loading={loadingFish}
                  onChange={(e, val) => updateFishAt(idx, { species: val })}
                  value={row.species}
                  freeSolo
                  renderInput={(params) => (
                    <TextField {...params} label={idx === 0 ? 'Species (multiple allowed)' : 'Species'} placeholder="Select species" fullWidth sx={{ minWidth: 260 }} />
                  )}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Count" type="number" value={row.count} onChange={(e) => updateFishAt(idx, { count: e.target.value })} fullWidth />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField label="Avg weight (g)" type="number" value={row.avgWeight} onChange={(e) => updateFishAt(idx, { avgWeight: e.target.value })} fullWidth />
              </Grid>
              <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton size="small" onClick={() => removeFishAt(idx)} disabled={(form.fishes || []).length <= 1} title="Remove species"><DeleteIcon /></IconButton>
                {idx === (form.fishes || []).length - 1 && (
                  <IconButton size="small" onClick={addFishRow} title="Add species"><AddIcon /></IconButton>
                )}
              </Grid>
            </React.Fragment>
          ))}

          <Grid item xs={12} sm={6}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">Transfer to pond?</Typography>
              <Switch checked={Boolean(form.transfer)} onChange={(e) => handleChange({ transfer: Boolean(e.target.checked) })} />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={pondOptions}
              getOptionLabel={(opt) => opt.label || opt.id || ''}
              loading={loadingPonds}
              disabled={!form.transfer}
              onChange={(e, val) => handleChange({ toPond: val })}
              value={typeof form.toPond === 'object' ? form.toPond : (pondOptions.find(p => (p.id === form.toPond || p.id === (form.toPond && form.toPond.id))) || null)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="To Pond"
                  placeholder="Select target pond"
                  fullWidth
                  sx={fieldSx}
                />
              )}
            />
          </Grid>

          {/* Sell-specific fields */}
          {!form.transfer && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField sx={fieldSx} label="Price per kg" type="number" value={form.pricePerKg} onChange={(e) => { handleChange({ pricePerKg: e.target.value }); setManualAmount(false); }} InputProps={{ startAdornment: <InputAdornment position="start">INR</InputAdornment> }} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField sx={fieldSx} label="Total amount (INR)" type="number" value={form.totalAmount} onChange={(e) => { setManualAmount(true); handleChange({ totalAmount: e.target.value }); }} InputProps={{ startAdornment: <InputAdornment position="start">INR</InputAdornment> }} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">Auto calculated amount: INR {computeAmount()}</Typography>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField sx={{ minWidth: 420 }} label="Notes" value={form.notes} onChange={(e) => handleChange({ notes: e.target.value })} fullWidth multiline rows={3} />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={() => { if (onCancel) onCancel(); }} variant="outlined">Cancel</Button>
              <Button onClick={handleSubmit} variant="contained">Transform</Button>
            </Stack>
          </Grid>

        </Grid>
      </form>
    </Paper>
  );
}

