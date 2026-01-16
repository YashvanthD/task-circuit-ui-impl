/**
 * SamplingPage
 * Manage fish sampling records.
 * Uses modular components for clean separation.
 *
 * @module pages/user/SamplingPage
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Paper,
  Typography,
  Dialog,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

// Components
import {
  PageHeader,
  FilterBar,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/common';
// Import from sampling folder (note: folder name must match exactly)
import SamplingStats from '../../components/sampling/SamplingStats';
import { SamplingForm } from '../../components/sampling';

// Utils & API
import samplingUtil from '../../utils/sampling';
import fishUtil from '../../utils/fish';
import { pondApi } from '../../api';
import userUtil from '../../utils/user';

export default function SamplingPage() {
  // State
  const [samplings, setSamplings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ponds, setPonds] = useState([]);
  const [fishOptions, setFishOptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [userNames, setUserNames] = useState({});

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [pondFilter, setPondFilter] = useState('all');
  const [fishFilter, setFishFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Snackbar
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  // Load data
  const loadPonds = useCallback(async () => {
    try {
      const res = await pondApi.listPonds();
      let data = res;
      if (res && res.json) data = await res.json();
      const list = data?.data?.ponds || (Array.isArray(data) ? data : data?.ponds || []);
      setPonds(list || []);
    } catch (e) {
      console.error('Failed to load ponds', e);
    }
  }, []);

  const loadFish = useCallback(async () => {
    try {
      const res = await fishUtil.getFishList();
      if (res?.data) setFishOptions(res.data || []);
    } catch (e) {
      console.error('Failed to load fish', e);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const ulist = await userUtil.fetchUsers();
      if (Array.isArray(ulist)) setUsers(ulist);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  }, []);

  const loadSamplings = useCallback(async ({ force = false } = {}) => {
    setLoading(true);
    setError('');
    try {
      const items = await samplingUtil.getSamplings({
        pondId: pondFilter !== 'all' ? pondFilter : null,
        fishId: fishFilter !== 'all' ? fishFilter : null,
        startDate: startDate || null,
        endDate: endDate || null,
        forceApi: force,
      });
      setSamplings(items || []);
    } catch (e) {
      console.error('Failed to load samplings', e);
      setError('Failed to load samplings');
    } finally {
      setLoading(false);
    }
  }, [pondFilter, fishFilter, startDate, endDate]);

  useEffect(() => {
    loadPonds();
    loadFish();
    loadUsers();
    loadSamplings();
  }, [loadPonds, loadFish, loadUsers, loadSamplings]);

  // Resolve user names
  useEffect(() => {
    let mounted = true;
    (async () => {
      const keys = Array.from(
        new Set(
          samplings
            .map((r) => r.recordedBy || r.recorded_by || r.recorded_by_userKey)
            .filter(Boolean)
        )
      );
      if (keys.length === 0) return;

      const missing = keys.filter((k) => !userNames[k]);
      if (missing.length === 0) return;

      const updates = {};
      for (const k of missing) {
        try {
          const name = await userUtil.getUserName(k, false);
          if (!mounted) return;
          if (name) updates[k] = name;
        } catch (e) {}
      }
      if (mounted && Object.keys(updates).length > 0) {
        setUserNames((prev) => ({ ...prev, ...updates }));
      }
    })();
    return () => { mounted = false; };
  }, [samplings, userNames]);

  // Filter options
  const pondOptions = useMemo(
    () =>
      ponds.map((p) => ({
        value: p.pondId || p.id || p.pond_id,
        label: p.farmName || p.pond_name || p.name || p.pondId || p.id,
      })),
    [ponds]
  );

  const fishFilterOptions = useMemo(
    () =>
      fishOptions.map((f) => ({
        value: f.speciesCode || f.id || f._id,
        label: `${f.commonName || f.name} | ${f.scientificName || ''} | ${f.speciesCode || f.id}`,
      })),
    [fishOptions]
  );


  // Handlers
  const handleAddNew = useCallback(() => {
    setEditItem(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((row) => {
    const initialData = {
      ...row,
      sampling_count: row.sampleSize ?? row.sample_count ?? row.count ?? 0,
      avg_weight:
        row.averageWeight !== undefined
          ? Number(row.averageWeight) * 1000
          : row.avg_weight ?? 1000,
      sampling_date: row.samplingDate ?? row.sampling_date ?? row.date ?? null,
      fish_cost: row.cost ?? row.cost_amount ?? row.fish_cost ?? 0,
      total_amount: row.totalAmount ?? row.total_amount ?? row.amount ?? 0,
      cost_enabled: row.cost_enabled ?? row.costEnabled ?? true,
      total_count: row.total_count ?? row.totalCount ?? 0,
      pond_id: row.pondId ?? row.pond ?? row.pond_id ?? '',
      notes: row.notes ?? row.note ?? '',
      species: row.species ?? row.fish ?? row.speciesCode ?? null,
      recorded_by_userKey: row.recordedBy ?? row.recorded_by ?? '',
    };
    setEditItem(initialData);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditItem(null);
  }, []);

  const handleSubmit = useCallback(
    async (data) => {
      try {
        if (editItem) {
          const id = editItem.samplingId || editItem.sampling_id || editItem.id;
          if (id) {
            await samplingUtil.updateSampling(id, data);
          } else {
            await samplingUtil.createSampling(data);
          }
        } else {
          await samplingUtil.createSampling(data);
        }
        handleDialogClose();
        setSnack({ open: true, message: 'Sampling saved successfully', severity: 'success' });
        await loadSamplings({ force: true });
      } catch (e) {
        console.error('Failed to save sampling', e);
        setSnack({ open: true, message: 'Failed to save sampling: ' + (e.message || e), severity: 'error' });
      }
    },
    [editItem, handleDialogClose, loadSamplings]
  );

  const handleSnackClose = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  // Helper to format fish display
  const formatFish = (r) => {
    const s = r.species || r.fish || '';
    if (!s) return '';
    if (typeof s === 'string') return s;
    const common = s.commonName || s.common_name || s.label;
    const sci = s.scientificName || s.scientific_name;
    const id = s.speciesId || s.speciesCode || s.id;
    if (common && sci) return `${common} (${sci})`;
    if (common) return common + (id ? ` [${id}]` : '');
    return id || '';
  };

  // Helper to format avg weight
  const formatAvgWeight = (r) => {
    const awKg = r.averageWeight ?? r.avg_weight ?? null;
    if (awKg === null || awKg === undefined || awKg === '') return '';
    const num = Number(awKg);
    if (!Number.isFinite(num)) return String(awKg);
    if (num <= 10) return `${(num * 1000).toFixed(0)} g`;
    return `${num.toFixed(0)} g`;
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, margin: '24px auto' }}>
      {/* Header */}
      <PageHeader
        title="Sampling"
        subtitle="Record fish sampling events (weight, count, location) to update stock/estimates."
      />

      {/* Stats */}
      <SamplingStats samplings={samplings} />

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search samplings..."
        filters={[
          {
            name: 'pond',
            label: 'Pond',
            value: pondFilter,
            options: pondOptions,
            onChange: setPondFilter,
          },
          {
            name: 'fish',
            label: 'Fish',
            value: fishFilter,
            options: fishFilterOptions,
            onChange: setFishFilter,
          },
        ]}
        dateRange={{
          start: startDate,
          onStartChange: setStartDate,
          end: endDate,
          onEndChange: setEndDate,
        }}
        onRefresh={() => loadSamplings({ force: true })}
        loading={loading}
        onAddNew={handleAddNew}
        addLabel="New Sampling"
      />

      {/* Error */}
      {error && <ErrorState message={error} onRetry={() => loadSamplings({ force: true })} compact />}

      {/* Loading */}
      {loading ? (
        <LoadingState message="Loading samplings..." />
      ) : samplings.length === 0 ? (
        <EmptyState
          icon="🔬"
          message="No samplings found."
          action={
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click "New Sampling" to record your first sampling event.
            </Typography>
          }
        />
      ) : (
        /* Table */
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Fish</TableCell>
                <TableCell>Recorded By</TableCell>
                <TableCell>Pond</TableCell>
                <TableCell align="right">Sampled</TableCell>
                <TableCell align="right">Total Fish</TableCell>
                <TableCell align="right">Avg Size</TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell align="center">Cost Enabled</TableCell>
                <TableCell align="right">Total (INR)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {samplings.map((r, idx) => (
                <TableRow key={r.id || r._id || idx}>
                  <TableCell>
                    {(r.samplingDate || r.sampling_date || r.date || r.createdAt || '').toString()}
                  </TableCell>
                  <TableCell>{formatFish(r)}</TableCell>
                  <TableCell>
                    {userNames[r.recordedBy || r.recorded_by || r.recorded_by_userKey] ||
                      r.recordedBy ||
                      r.recorded_by ||
                      ''}
                  </TableCell>
                  <TableCell>{r.pondId || r.pond || r.pond_id || ''}</TableCell>
                  <TableCell align="right">
                    {r.sampleSize || r.sample_size || r.sample_count || r.count || 0}
                  </TableCell>
                  <TableCell align="right">
                    {r.totalCount ?? r.total_count ?? ''}
                  </TableCell>
                  <TableCell align="right">{formatAvgWeight(r)}</TableCell>
                  <TableCell align="right">
                    {r.cost ?? r.cost_amount ?? r.fish_cost ?? ''}
                  </TableCell>
                  <TableCell align="center">
                    {(r.cost_enabled ?? r.costEnabled ?? true) ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell align="right">
                    {r.totalAmount ?? r.total_amount ?? r.amount ?? ''}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(r)} title="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <SamplingForm
          initialData={editItem || {}}
          onSubmit={handleSubmit}
          onCancel={handleDialogClose}
          ponds={ponds}
          fishOptions={fishOptions}
          users={users}
        />
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={6000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
