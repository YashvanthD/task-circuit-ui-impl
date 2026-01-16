import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Grid, TextField, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Stack, CircularProgress, Autocomplete
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { pondApi } from '../../api';
import userUtil from '../../utils/user';
import { loadUserFromLocalStorage } from '../../utils/auth/storage';

// Simple local-storage backed water tests utility inside the page for now
const STORAGE_KEY = 'water_tests_v1';
const DESCRIBE_STORAGE_KEY = 'water_test_describe_options';

const DESCRIBE_OPTIONS = [
  'Salty', 'Fresh', 'Solid', 'Ammoniated', 'Not well maintained', 'Other'
];

function loadDescribeOptions() {
  try {
    const raw = localStorage.getItem(DESCRIBE_STORAGE_KEY);
    if (!raw) return DESCRIBE_OPTIONS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DESCRIBE_OPTIONS;
    return parsed;
  } catch (e) {
    return DESCRIBE_OPTIONS;
  }
}

function saveDescribeOptions(opts) {
  try {
    localStorage.setItem(DESCRIBE_STORAGE_KEY, JSON.stringify(opts));
  } catch (e) { /* ignore */ }
}

function loadWaterTests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.warn('Failed to load water tests from localStorage', e);
    return [];
  }
}

function saveWaterTests(tests) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  } catch (e) {
    console.warn('Failed to save water tests to localStorage', e);
  }
}

function computeStatus(ph, temp) {
  // Heuristic: good if ph in [6.5,8.5] and temp in [22,32]
  const p = Number(ph);
  const t = Number(temp);
  if (!Number.isFinite(p) || !Number.isFinite(t)) return 'avg';
  const phOk = p >= 6.5 && p <= 8.5;
  const tempOk = t >= 22 && t <= 32;
  if (phOk && tempOk) return 'good';
  if (!phOk && !tempOk) return 'poor';
  return 'avg';
}

export default function WaterTestPage() {
  const [ponds, setPonds] = useState([]);
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [describeOptions, setDescribeOptions] = useState(() => loadDescribeOptions());
  // added additional water-quality fields: o2 (dissolved oxygen), ammonia, salinity, turbidity, nitrate
  const [form, setForm] = useState({ date: '', time: '', pondId: '', ph: '', temp: '', o2: '', ammonia: '', salinity: '', turbidity: '', nitrate: '', describe: '', notes: '', conductedBy: '' });
  // filters: pond and date range
  const [filters, setFilters] = useState({ pondId: '', startDate: '', endDate: '' });
  const [editingId, setEditingId] = useState(null);
  // dialog that hosts the full form (opened for new test or edit)
  const [openFormDialog, setOpenFormDialog] = useState(false);

  // load current user from localStorage to default 'conductedBy'
  const currentUser = loadUserFromLocalStorage();
  const defaultConductedBy = currentUser?.userKey || currentUser?.id || currentUser?._id || '';

  // shared small field style to avoid shrinkage
  const fieldSx = { minWidth: 220 };

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await pondApi.listPonds();
        let data = res;
        if (res && res.json) data = await res.json();
        const list = data && data.data && data.data.ponds ? data.data.ponds : (Array.isArray(data) ? data : (data && data.ponds ? data.ponds : []));
        setPonds(list || []);
      } catch (e) {
        console.warn('Failed to load ponds', e);
      }
      try {
        const ulist = await userUtil.fetchUsers();
        if (Array.isArray(ulist)) {
          // ensure current user is present in the users list so Conducted by shows a name
          let list = ulist;
          if (currentUser) {
            const key = currentUser.userKey || currentUser.id || currentUser._id;
            const exists = list.some(u => (u.userKey || u.id || u._id) === key);
            if (!exists) {
              const name = currentUser.name || currentUser.username || currentUser.email || key;
              list = [{ userKey: key, name }, ...list];
            }
          }
          setUsers(list);
        }
      } catch (e) { console.warn('Failed to load users', e); }

      const loaded = loadWaterTests();
      // ensure we don't load more than 100 records
      setTests((loaded || []).slice(0, 100));
      setLoading(false);
    })();
  }, []);

  // Ensure form defaults to current user for 'conductedBy' on initial mount
  useEffect(() => {
    if (defaultConductedBy) {
      setForm(f => ({ ...f, conductedBy: f.conductedBy || defaultConductedBy }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultConductedBy]);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await pondApi.listPonds();
      let data = res;
      if (res && res.json) data = await res.json();
      const list = data && data.data && data.data.ponds ? data.data.ponds : (Array.isArray(data) ? data : (data && data.ponds ? data.ponds : []));
      setPonds(list || []);
    } catch (e) { console.warn('Failed to refresh ponds', e); }
    setTests((loadWaterTests() || []).slice(0, 100));
    setLoading(false);
  };

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFilterChange = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    const datePart = form.date || new Date().toISOString().slice(0,10);
    const timePart = form.time || new Date().toTimeString().slice(0,5);
    const iso = new Date(datePart + 'T' + timePart).toISOString();
    const id = editingId || String(Date.now());
    let status = computeStatus(form.ph, form.temp);
    // consider low dissolved oxygen as poor irrespective of ph/temp
    const o2v = Number(form.o2);
    if (Number.isFinite(o2v) && o2v < 4) {
      // override to poor if DO is critically low
      // eslint-disable-next-line no-console
      console.warn('Overriding status due to low DO:', o2v);
      status = 'poor';
    }
    const pond = ponds.find(p => (p.pondId || p.id || p.pond_id) === form.pondId) || {};
    const conductedByName = users.find(u => (u.userKey || u.id || u._id) === form.conductedBy)?.name || form.conductedBy;

    const item = { id, date: iso, pondId: form.pondId, pondName: pond.farmName || pond.pond_name || pond.name || form.pondId, ph: form.ph, temp: form.temp, o2: form.o2, ammonia: form.ammonia, salinity: form.salinity, turbidity: form.turbidity, nitrate: form.nitrate, status, describe: form.describe, notes: form.notes, conductedBy: form.conductedBy, conductedByName };

    let updated;
    if (editingId) {
      updated = tests.map(t => t.id === editingId ? item : t);
    } else {
      updated = [item, ...tests];
    }
    // keep only latest 100 records to avoid uncontrolled growth
    updated = updated.slice(0, 100);
    setTests(updated);
    saveWaterTests(updated);
    // if new describe value supplied by user, persist it for future autocomplete
    const desc = (form.describe || '').trim();
    if (desc) {
      const exists = describeOptions.find(d => String(d).toLowerCase() === desc.toLowerCase());
      if (!exists) {
        const next = [desc, ...describeOptions].slice(0, 200);
        setDescribeOptions(next);
        saveDescribeOptions(next);
      }
    }
    // reset form
    setForm({ date: '', time: '', pondId: '', ph: '', temp: '', o2: '', ammonia: '', salinity: '', turbidity: '', nitrate: '', describe: '', notes: '', conductedBy: defaultConductedBy });
    setEditingId(null);
    setOpenFormDialog(false);
  };

  const handleEdit = (t) => {
    const d = new Date(t.date);
    setForm({ date: d.toISOString().slice(0,10), time: d.toTimeString().slice(0,5), pondId: t.pondId, ph: t.ph, temp: t.temp, o2: t.o2 || '', ammonia: t.ammonia || '', salinity: t.salinity || '', turbidity: t.turbidity || '', nitrate: t.nitrate || '', describe: t.describe, notes: t.notes, conductedBy: t.conductedBy });
    setEditingId(t.id);
    setOpenFormDialog(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this water test?')) return;
    const updated = tests.filter(t => t.id !== id);
    setTests(updated);
    saveWaterTests(updated);
  };

  // apply filters then take latest 10
  const filtered = tests.filter((t) => {
    if (filters.pondId && t.pondId !== filters.pondId) return false;
    try {
      const td = new Date(t.date);
      if (filters.startDate) {
        const sd = new Date(filters.startDate + 'T00:00:00');
        if (td < sd) return false;
      }
      if (filters.endDate) {
        const ed = new Date(filters.endDate + 'T23:59:59');
        if (td > ed) return false;
      }
    } catch (e) {
      // ignore parse errors and include the row
    }
    return true;
  });
  const latestTen = filtered.slice(0, 10);

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, margin: '24px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Water Tests</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>Record and view recent water quality tests.</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p:2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h6">Latest 10 Tests</Typography>
                  {loading ? <CircularProgress size={18} /> : null}
                </Stack>
              </Grid>
              <Grid item xs={12} md={5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField sx={{ minWidth: 180 }} select size="small" label="Filter Pond" value={filters.pondId} onChange={(e) => handleFilterChange('pondId', e.target.value)}>
                    <MenuItem value="">All ponds</MenuItem>
                    {ponds.map(p => (<MenuItem key={p.pondId || p.id || p.pond_id} value={p.pondId || p.id || p.pond_id}>{p.farmName || p.pond_name || p.name || p.pondId}</MenuItem>))}
                  </TextField>
                  <TextField size="small" sx={{ minWidth: 160 }} label="Start Date" type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} InputLabelProps={{ shrink: true }} />
                  <TextField size="small" sx={{ minWidth: 160 }} label="End Date" type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} InputLabelProps={{ shrink: true }} />
                </Stack>
              </Grid>
              <Grid item xs={12} md={2}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <IconButton onClick={refresh} title="Refresh"><RefreshIcon /></IconButton>
                  <Button variant="contained" onClick={() => {
                    setEditingId(null);
                    setForm({ date: '', time: '', pondId: (ponds[0] && (ponds[0].pondId || ponds[0].id || ponds[0].pond_id)) || '', ph: '', temp: '', o2: '', ammonia: '', salinity: '', turbidity: '', nitrate: '', describe: '', notes: '', conductedBy: defaultConductedBy });
                    setOpenFormDialog(true);
                  }}>New Test</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p:2 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date Time</TableCell>
                    <TableCell>Pond</TableCell>
                    <TableCell>pH</TableCell>
                    <TableCell>Temp</TableCell>
                    <TableCell>O2 (mg/L)</TableCell>
                    <TableCell>Ammonia (ppm)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Describe</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Conducted By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestTen.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11}><Typography variant="body2">No water tests recorded.</Typography></TableCell>
                    </TableRow>
                  )}
                  {latestTen.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.date).toLocaleString()}</TableCell>
                      <TableCell>{t.pondName || t.pondId}</TableCell>
                      <TableCell>{t.ph}</TableCell>
                      <TableCell>{t.temp}</TableCell>
                      <TableCell>{t.o2 ?? ''}</TableCell>
                      <TableCell>{t.ammonia ?? ''}</TableCell>
                      <TableCell>{t.status}</TableCell>
                      <TableCell>{t.describe}</TableCell>
                      <TableCell>{t.notes}</TableCell>
                      <TableCell>{t.conductedByName || t.conductedBy}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleEdit(t)} title="Edit"><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(t.id)} title="Delete"><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Dialog containing the reusable form */}
        <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Edit Water Test' : 'New Water Test'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField sx={fieldSx} label="Date" type="date" fullWidth value={form.date} onChange={(e) => handleChange('date', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField sx={fieldSx} label="Time" type="time" fullWidth value={form.time} onChange={(e) => handleChange('time', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField sx={fieldSx} select label="Pond" fullWidth value={form.pondId} onChange={(e) => handleChange('pondId', e.target.value)}>
                  <MenuItem value="">Select pond</MenuItem>
                  {ponds.map(p => (<MenuItem key={p.pondId || p.id || p.pond_id} value={p.pondId || p.id || p.pond_id}>{p.farmName || p.pond_name || p.name || p.pondId}</MenuItem>))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField sx={fieldSx} label="pH" fullWidth value={form.ph} onChange={(e) => handleChange('ph', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField sx={fieldSx} label="Temp (°C)" fullWidth value={form.temp} onChange={(e) => handleChange('temp', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField sx={fieldSx} label="Dissolved O2 (mg/L)" fullWidth value={form.o2} onChange={(e) => handleChange('o2', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField sx={fieldSx} label="Ammonia (ppm)" fullWidth value={form.ammonia} onChange={(e) => handleChange('ammonia', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField sx={fieldSx} label="Salinity (ppt)" fullWidth value={form.salinity} onChange={(e) => handleChange('salinity', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField sx={fieldSx} label="Turbidity (NTU)" fullWidth value={form.turbidity} onChange={(e) => handleChange('turbidity', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField sx={fieldSx} label="Nitrate (ppm)" fullWidth value={form.nitrate} onChange={(e) => handleChange('nitrate', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  freeSolo
                  options={describeOptions}
                  value={form.describe}
                  inputValue={form.describe}
                  onInputChange={(e, newInput) => handleChange('describe', newInput || '')}
                  onChange={(e, newVal) => handleChange('describe', newVal || '')}
                  renderInput={(params) => <TextField {...params} sx={fieldSx} label="Describe" fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField sx={fieldSx} label="Notes" fullWidth multiline rows={3} value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField sx={fieldSx} select label="Conducted by" fullWidth value={form.conductedBy} onChange={(e) => handleChange('conductedBy', e.target.value)}>
                  <MenuItem value="">Select user</MenuItem>
                  {users.map(u => (<MenuItem key={u.userKey || u.id || u._id} value={u.userKey || u.id || u._id}>{u.name || u.username || (u.email || '')}</MenuItem>))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFormDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Update' : 'Save'}</Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Paper>
  );
}
