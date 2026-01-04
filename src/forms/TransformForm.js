import React, { useEffect, useState, useRef } from 'react';
import { Paper, Typography, Grid, TextField, Button, Stack, Autocomplete, IconButton, Tooltip, Box, InputAdornment } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getPondOptions } from '../utils/options';
import Switch from '@mui/material/Switch';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function TransformForm({ initialData = {}, onSubmit, onCancel }) {
  const mountedRef = useRef(true);
  const [pondOptions, setPondOptions] = useState([]);
  const [loadingPonds, setLoadingPonds] = useState(false);
  const [manualAmount, setManualAmount] = useState(false);

  // form state
  const [form, setForm] = useState({
    fromPond: initialData.fromPond || '',
    toPond: initialData.toPond || '',
    count: initialData.count ?? 0,
    // average weight per fish in grams (used to compute kg)
    avgWeight: initialData.avgWeight ?? 1000,
    // when selling
    pricePerKg: initialData.pricePerKg ?? 0,
    totalAmount: initialData.totalAmount ?? 0,
    transfer: initialData.transfer !== undefined ? Boolean(initialData.transfer) : true, // true = move between ponds, false = sell
    notes: initialData.notes || '',
  });

  const fieldSx = { minWidth: 220 };

  useEffect(() => {
    mountedRef.current = true;
    loadPonds();
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

  const handleChange = (patch) => setForm(f => ({ ...f, ...patch }));

  // compute amount when selling: count * (avgWeight g -> kg) * pricePerKg
  const computeAmount = () => {
    const cnt = Number(form.count) || 0;
    const avgKg = (Number(form.avgWeight) || 0) / 1000;
    const price = Number(form.pricePerKg) || 0;
    const amt = cnt * avgKg * price;
    return Number(isFinite(amt) ? amt.toFixed(2) : 0);
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
  }, [form.count, form.avgWeight, form.pricePerKg, form.transfer, manualAmount]);

  const handleReloadPonds = async () => {
    await loadPonds();
  };

  const handleSubmit = (e) => {
    e && e.preventDefault && e.preventDefault();
    // normalize ponds to ids
    const from = typeof form.fromPond === 'object' ? (form.fromPond.id || form.fromPond.raw?.id || '') : form.fromPond;
    const to = typeof form.toPond === 'object' ? (form.toPond.id || form.toPond.raw?.id || '') : form.toPond;
    const payload = {
      eventType: form.transfer ? 'move' : 'sell',
      fromPond: from,
      toPond: form.transfer ? to : null,
      count: Number(form.count) || 0,
      avgWeight: Number(form.avgWeight) || 0,
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

          <Grid item xs={12} sm={6}>
            <TextField sx={fieldSx} label="Fish count" type="number" value={form.count} onChange={(e) => handleChange({ count: e.target.value })} fullWidth />
          </Grid>

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

          <Grid item xs={12} sm={6}>
            <TextField sx={fieldSx} label="Avg weight (g)" type="number" value={form.avgWeight} onChange={(e) => handleChange({ avgWeight: e.target.value })} fullWidth />
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

