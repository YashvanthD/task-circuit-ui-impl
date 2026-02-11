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
  Button,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

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
import { StockForm } from '../../components/stock/forms';

// Utils & API
import samplingUtil from '../../utils/sampling';
import fishUtil from '../../utils/fish';
import { pondApi } from '../../api';
import userUtil from '../../utils/user';
import { createStock } from '../../services/stockService';
import { Sampling, Stock } from '../../models';

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
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);

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

      // Transform to Sampling model instances
      const samplingModels = Sampling.toList(items || []);
      setSamplings(samplingModels);
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

  const handleEdit = useCallback((samplingModel) => {
    // Use model's toFormData() method to get properly formatted data
    const initialData = samplingModel.toFormData();
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

  // Stock form handlers
  const handleOpenStockForm = useCallback(() => {
    setStockDialogOpen(true);
  }, []);

  const handleCloseStockForm = useCallback(() => {
    setStockDialogOpen(false);
  }, []);

  const handleStockSubmit = useCallback(async (stockData) => {
    setStockLoading(true);
    try {
      const result = await createStock(stockData);
      if (result.success) {
        setSnack({ open: true, message: 'Stock created successfully', severity: 'success' });
        handleCloseStockForm();
        // Optionally refresh data
        await loadSamplings({ force: true });
      } else {
        setSnack({ open: true, message: result.error || 'Failed to create stock', severity: 'error' });
      }
    } catch (error) {
      console.error('[SamplingPage] Failed to create stock:', error);
      setSnack({ open: true, message: 'Failed to create stock', severity: 'error' });
    } finally {
      setStockLoading(false);
    }
  }, [handleCloseStockForm, loadSamplings]);


  return (
    <Paper sx={{ p: 4, maxWidth: 1200, margin: '24px auto' }}>
      {/* Header */}
      <PageHeader
        title="Sampling"
        subtitle="Record fish sampling events (weight, count, location) to update stock/estimates."
      />

      {/* Stats */}
      <SamplingStats samplings={samplings} />

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          New Sampling
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleOpenStockForm}
        >
          Add Stock
        </Button>
      </Stack>

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
              {samplings.map((sampling, idx) => (
                <TableRow key={sampling.getSamplingId() || idx}>
                  <TableCell>
                    {sampling.sample_date || sampling.sampling_date || sampling.created_at || ''}
                  </TableCell>
                  <TableCell>{sampling.formatFishDisplay()}</TableCell>
                  <TableCell>
                    {userNames[sampling.recorded_by] || sampling.recorded_by || ''}
                  </TableCell>
                  <TableCell>
                    {ponds.find(p => String(p.pond_id) === String(sampling.pond_id || sampling.pond))?.name || sampling.pond_name || sampling.pond_id || '-'}
                  </TableCell>
                  <TableCell align="right">
                    {sampling.sample_count || 0}
                  </TableCell>
                  <TableCell align="right">
                    {sampling.total_count || ''}
                  </TableCell>
                  <TableCell align="right">{sampling.formatAvgWeight()}</TableCell>
                  <TableCell align="right">
                    {sampling.cost || ''}
                  </TableCell>
                  <TableCell align="center">
                    {sampling.cost_enabled ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell align="right">
                    {sampling.total_amount || ''}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(sampling)} title="Edit">
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

      {/* Stock Form Dialog */}
      <Dialog open={stockDialogOpen} onClose={handleCloseStockForm} maxWidth="md" fullWidth>
        <StockForm
          onSubmit={handleStockSubmit}
          onCancel={handleCloseStockForm}
          loading={stockLoading}
          mode="add"
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
