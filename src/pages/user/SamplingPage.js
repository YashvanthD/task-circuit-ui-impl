import React, { useEffect, useState, useCallback } from 'react';
import { Paper, Typography, Button, Grid, Dialog, TextField, MenuItem, IconButton, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import SamplingForm from '../../forms/SamplingForm';
import samplingUtil from '../../utils/sampling';
import fishUtil from '../../utils/fish';
import * as apiPond from '../../utils/apis/api_pond';
import userUtil from '../../utils/user';

export default function SamplingPage() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ponds, setPonds] = useState([]);
  const [fishOptions, setFishOptions] = useState([]);
  const [filters, setFilters] = useState({ pondId: '', fishId: '', startDate: '', endDate: '' });
  const [editItem, setEditItem] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [users, setUsers] = useState([]);

  const loadPonds = useCallback(async () => {
    try {
      const res = await apiPond.listPonds();
      let data = res;
      if (res && res.json) data = await res.json();
      const list = data && data.data && data.data.ponds ? data.data.ponds : (Array.isArray(data) ? data : (data && data.ponds ? data.ponds : []));
      setPonds(list || []);
    } catch (e) { console.error('Failed to load ponds', e); }
  }, []);

  const loadFish = useCallback(async () => {
    try {
      const res = await fishUtil.getFishList();
      if (res && res.data) setFishOptions(res.data || []);
    } catch (e) { console.error('Failed to load fish', e); }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const ulist = await userUtil.fetchUsers();
      if (Array.isArray(ulist)) setUsers(ulist);
    } catch (e) { console.error('Failed to load users', e); }
  }, []);

  const loadSamplings = useCallback(async ({ force = false } = {}) => {
    setLoading(true);
    try {
      const items = await samplingUtil.getSamplings({ pondId: filters.pondId || null, fishId: filters.fishId || null, startDate: filters.startDate || null, endDate: filters.endDate || null, forceApi: force });
      setRows(items || []);
    } catch (e) { console.error('Failed to load samplings', e); }
    setLoading(false);
  }, [filters.pondId, filters.fishId, filters.startDate, filters.endDate]);

  useEffect(() => { loadPonds(); loadFish(); loadSamplings(); loadUsers(); }, [loadPonds, loadFish, loadSamplings, loadUsers]);

  useEffect(() => { // reload when filters change
    loadSamplings();
  }, [filters.pondId, filters.fishId, filters.startDate, filters.endDate, loadSamplings]);

  const handleOpen = () => { setEditItem(null); setOpen(true); };
  const handleClose = () => { setEditItem(null); setOpen(false); };
  const handleEdit = (row) => {
    // Normalize backend row to SamplingForm initialData shape
    const initialData = {
      ...row,
      sampling_count: row.sampleSize ?? row.sample_count ?? row.count ?? row.sample_size ?? 0,
      // Backend averageWeight is stored in kg. The form expects grams, so convert kg->g when populating.
      avg_weight: (row.averageWeight !== undefined && row.averageWeight !== null) ? (Number(row.averageWeight) * 1000) : (row.avg_weight ?? row.average_size ?? 1000),
      sampling_date: (row.samplingDate ?? row.sampling_date ?? row.date ?? (row.createdAt || row.created_at)) || null,
      fish_cost: row.cost ?? row.cost_amount ?? row.fish_cost ?? 0,
      total_amount: row.totalAmount ?? row.total_amount ?? row.amount ?? 0,
      total_count: row.total_count ?? row.totalCount ?? row.totalCountRaw ?? 0,
      totalCount: row.totalCount ?? row.total_count ?? row.totalCountRaw ?? 0,
      pond_id: row.pondId ?? row.pond ?? row.pond_id ?? '',
      notes: row.notes ?? row.note ?? '',
      species: row.species ?? row.fish ?? row.speciesCode ?? row.id ?? null,
      recorded_by_userKey: row.recordedBy ?? row.recorded_by ?? row.recorded_by_user ?? row.recorded_by_userKey ?? row.recordedByUser ?? '',
    };
    setEditItem(initialData);
    setOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editItem) {
        const id = editItem.samplingId || editItem.sampling_id || editItem.id || editItem._id;
        if (id) {
          await samplingUtil.updateSampling(id, data);
        } else {
          // fallback to create if no id present
          await samplingUtil.createSampling(data);
        }
      } else {
        await samplingUtil.createSampling(data);
      }
      handleClose();
      // reload from api to reflect newly created/updated sampling
      await loadSamplings({ force: true });
    } catch (e) {
      console.error('Failed to save sampling', e);
      alert('Failed to save sampling: ' + (e.message || e));
    }
  };

  useEffect(() => {
    // resolve recordedBy names for current rows (only depends on rows)
    let mounted = true;
    (async () => {
      const keys = Array.from(new Set(rows.map(r => r.recordedBy || r.recorded_by || r.recorded_by_user || r.recorded_by_userKey || r.recordedByUser).filter(Boolean)));
      if (keys.length === 0) return;
      // determine which keys are missing in cache
      const missing = keys.filter(k => !userNames[k]);
      if (missing.length === 0) return;
      const updates = {};
      for (const k of missing) {
        try {
          const name = await userUtil.getUserName(k, false);
          if (!mounted) return;
          if (name) updates[k] = name;
        } catch (e) { console.warn('Failed to resolve user name for', k, e); }
      }
      if (mounted && Object.keys(updates).length > 0) setUserNames(prev => ({ ...prev, ...updates }));
    })();
    return () => { mounted = false; };
  }, [rows, userNames]);

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, margin: '24px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Sampling</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>Record fish sampling events (weight, count, location) to update stock/estimates.</Typography>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <Button variant="contained" onClick={handleOpen}>New Sampling</Button>
        </Grid>
        <Grid item>
          <IconButton onClick={() => loadSamplings({ force: true })} title="Refresh samplings">
            <RefreshIcon />
          </IconButton>
        </Grid>
        <Grid item>
          {loading ? <CircularProgress size={20} /> : null}
        </Grid>
        <Grid item>
          <TextField select label="Pond" size="small" value={filters.pondId} onChange={(e) => setFilters(f => ({ ...f, pondId: e.target.value }))} sx={{ minWidth: 220 }}>
            <MenuItem value="">All ponds</MenuItem>
            {ponds.map(p => (<MenuItem key={p.pondId || p.id || p.pond_id} value={p.pondId || p.id || p.pond_id}>{p.farmName || p.pond_name || p.name || p.pondId || p.id}</MenuItem>))}
          </TextField>
        </Grid>
        <Grid item>
          <TextField select label="Fish" size="small" value={filters.fishId} onChange={(e) => setFilters(f => ({ ...f, fishId: e.target.value }))} sx={{ minWidth: 300 }}>
            <MenuItem value="">All species</MenuItem>
            {fishOptions.map(f => (<MenuItem key={f.speciesCode || f.id || f._id} value={f.speciesCode || f.id || f._id}>{`${f.commonName || f.name} | ${f.scientificName || ''} | ${f.speciesCode || f.id || f._id}`}</MenuItem>))}
          </TextField>
        </Grid>
        <Grid item>
          <TextField label="Start Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={filters.startDate} onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))} />
        </Grid>
        <Grid item>
          <TextField label="End Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={filters.endDate} onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))} />
        </Grid>
      </Grid>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Fish</TableCell>
              <TableCell>Recorded By</TableCell>
              <TableCell>Pond</TableCell>
              <TableCell align="right">Sampled</TableCell>
              <TableCell align="right">Total fish</TableCell>
              <TableCell align="right">Avg size (g)</TableCell>
               <TableCell align="right">Cost</TableCell>
               <TableCell align="right">Total (INR)</TableCell>
               <TableCell>Actions</TableCell>
             </TableRow>
           </TableHead>
           <TableBody>
             {rows.map((r, idx) => (
               <TableRow key={r.id || r._id || idx}>
                <TableCell>{(r.samplingDate || r.sampling_date || r.date || r.createdAt || r.created_at || '').toString()}</TableCell>
                 <TableCell>{(() => {
                  const s = r.species || r.fish || '';
                  if (!s) return '';
                  if (typeof s === 'string') return s;
                  // object shape handling
                  const common = s.commonName || s.common_name || s.common || s.label;
                  const sci = s.scientificName || s.scientific_name || s.scientific;
                  const id = s.speciesId || s.species_id || s.speciesCode || s.id || s._id;
                  if (common && sci) return `${common} (${sci})`;
                  if (common) return common + (id ? ` [${id}]` : '');
                  if (sci) return sci + (id ? ` [${id}]` : '');
                  // if id present return it, otherwise return empty string (avoid dumping object)
                  return id || '';
                })()}</TableCell>
                <TableCell>{userNames[r.recordedBy || r.recorded_by || r.recorded_by_user || r.recorded_by_userKey || r.recordedByUser] || (r.recordedBy || r.recorded_by || r.recorded_by_user || r.recorded_by_userKey || r.recordedByUser || '')}</TableCell>
                <TableCell>{r.pondId || r.pond || r.pond_id || ''}</TableCell>
                <TableCell align="right">{r.sampleSize || r.sample_size || r.sample_count || r.count || 0}</TableCell>
                <TableCell align="right">{(r.totalCount ?? r.total_count ?? r.total_count ?? r.totalCount ?? '') || ''}</TableCell>
                <TableCell align="right">{(() => {
                   // display avg weight in grams for readability (form uses grams, backend stores kg)
                   const awKg = r.averageWeight ?? r.avg_weight ?? r.average_size ?? null;
                   if (awKg === null || awKg === undefined || awKg === '') return '';
                   const num = Number(awKg);
                   if (!Number.isFinite(num)) return String(awKg);
                   // if value looks like kg (<=100 likely kg?), but treat numbers < 10 as kg -> convert to g
                   // Heuristic: if num <= 10 assume kg and convert to g; if >10 assume grams already
                   if (num <= 10) return `${(num * 1000).toFixed(0)} g`;
                   return `${num.toFixed(0)} g`;
                })()}</TableCell>
                <TableCell align="right">{(r.cost ?? r.cost_amount ?? r.fish_cost) || ''}</TableCell>
                <TableCell align="right">{(r.totalAmount ?? r.total_amount ?? r.amount) || ''}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(r)} title="Edit"><EditIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={10}><Typography variant="body2">No samplings found.</Typography></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <SamplingForm initialData={editItem || {}} onSubmit={handleSubmit} onCancel={handleClose} ponds={ponds} fishOptions={fishOptions} users={users} />
      </Dialog>
    </Paper>
  );
}
