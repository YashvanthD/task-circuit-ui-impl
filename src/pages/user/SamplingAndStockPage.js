/**
 * SamplingAndStockPage
 * Stock-centric page with integrated sampling management
 * Displays stocks as primary entities with embedded sampling history
 *
 * @module pages/user/SamplingAndStockPage
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Snackbar,
  Alert,
  Dialog,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Components
import {
  PageHeader,
  FilterBar,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/common';
import { StockCard, StockOverviewStats, StockDetailsModal, TerminateStockDialog } from '../../components/stock';
import { AddSamplingDialog, EditSamplingDialog } from '../../components/sampling';
import { StockForm } from '../../components/stock/forms';

// Services & Utils
import { fetchStocks, createStock, terminateStock } from '../../services/stockService';
import samplingUtil from '../../utils/sampling';
import { pondApi } from '../../api';
import fishUtil from '../../utils/fish';
import { Stock, Sampling } from '../../models';

export default function SamplingAndStockPage() {
  // State - Stocks
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State - Samplings (grouped by stock_id)
  const [samplingsByStock, setSamplingsByStock] = useState({});

  // State - Filter options
  const [ponds, setPonds] = useState([]);
  const [species, setSpecies] = useState([]);

  // State - Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pondFilter, setPondFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State - Dialogs
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [samplingDialogOpen, setSamplingDialogOpen] = useState(false);
  const [editSamplingDialogOpen, setEditSamplingDialogOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedSampling, setSelectedSampling] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // State - Snackbar
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  // Load filter options
  const loadPonds = useCallback(async () => {
    try {
      const res = await pondApi.listPonds();
      let data = res;
      if (res && res.json) data = await res.json();
      const list = data?.data?.ponds || (Array.isArray(data) ? data : data?.ponds || []);
      setPonds(list || []);
    } catch (e) {
      console.error('[SamplingAndStockPage] Failed to load ponds:', e);
    }
  }, []);

  const loadSpecies = useCallback(async () => {
    try {
      const res = await fishUtil.getFishList();
      if (res?.data) setSpecies(res.data || []);
    } catch (e) {
      console.error('[SamplingAndStockPage] Failed to load species:', e);
    }
  }, []);

  const loadSamplingsForStocks = useCallback(async (stocksList) => {
    const samplingsByStockId = {};

    await Promise.all(
      stocksList.map(async (stock) => {
        try {
          const samplings = await samplingUtil.getSamplings({
            stockId: stock.stock_id,
            limit: 10,
            forceApi: true,
          });

          const models = Sampling.toList(samplings || []).sort((a, b) => {
            const dateA = new Date(a.sample_date);
            const dateB = new Date(b.sample_date);
            return dateB - dateA;
          });


          samplingsByStockId[stock.stock_id] = models;
        } catch (e) {
          console.error(`Failed to load samplings for stock ${stock.stock_id}:`, e);
          samplingsByStockId[stock.stock_id] = [];
        }
      })
    );

    setSamplingsByStock(samplingsByStockId);
  }, []);

  // Load stocks
  const loadStocks = useCallback(async ({ force = false } = {}) => {
    setLoading(true);
    setError('');
    try {
      // Only pass status filter if it's not 'all'
      const filterParams = {};
      if (statusFilter && statusFilter !== 'all') {
        filterParams.status = statusFilter;
      }

      const stocksData = await fetchStocks({
        ...filterParams,
        forceApi: force,
      });

      // Convert to Stock model instances
      const stockModels = Stock.toList(stocksData || []);
      setStocks(stockModels);

      // Load samplings for each stock
      await loadSamplingsForStocks(stockModels);
    } catch (e) {
      console.error('[SamplingAndStockPage] Failed to load stocks:', e);
      setError('Failed to load stocks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, loadSamplingsForStocks]);

  // Initial load
  useEffect(() => {
    loadStocks();
    loadPonds();
    loadSpecies();
  }, [loadStocks, loadPonds, loadSpecies]);

  // Filter stocks by search term, pond, species, and date
  const filteredStocks = stocks.filter((stock) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        stock.species_name?.toLowerCase().includes(search) ||
        stock.stock_id?.toLowerCase().includes(search) ||
        stock.pond_id?.toLowerCase().includes(search);

      if (!matchesSearch) return false;
    }

    // Pond filter
    if (pondFilter && pondFilter !== 'all') {
      if (stock.pond_id !== pondFilter) return false;
    }

    // Species filter
    if (speciesFilter && speciesFilter !== 'all') {
      if (stock.species_id !== speciesFilter) return false;
    }

    // Date range filter
    if (startDate || endDate) {
      const stockDate = new Date(stock.stocking_date);

      if (startDate) {
        const start = new Date(startDate);
        if (stockDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (stockDate > end) return false;
      }
    }

    return true;
  });


  // Handlers - Stock
  const handleAddStock = useCallback(() => {
    setStockDialogOpen(true);
  }, []);

  const handleCloseStockDialog = useCallback(() => {
    setStockDialogOpen(false);
  }, []);

  const handleStockSubmit = useCallback(async (stockData) => {
    setSubmitting(true);
    try {
      const result = await createStock(stockData);
      if (result.success) {
        setSnack({ open: true, message: 'Stock created successfully! 🎉', severity: 'success' });
        handleCloseStockDialog();
        await loadStocks({ force: true });
      } else {
        setSnack({
          open: true,
          message: result.error || 'Failed to create stock',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('[SamplingAndStockPage] Failed to create stock:', error);
      setSnack({
        open: true,
        message: `Failed to create stock: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  }, [handleCloseStockDialog, loadStocks]);

  const handleTerminateStock = useCallback((stock) => {
    setSelectedStock(stock);
    setTerminateDialogOpen(true);
  }, []);

  const handleTerminateSubmit = useCallback(async (terminationData) => {
    if (!selectedStock) return;

    setSubmitting(true);
    try {
      const result = await terminateStock(selectedStock.stock_id, terminationData);

      if (result.success) {
        setSnack({
          open: true,
          message: 'Stock terminated successfully',
          severity: 'success'
        });
        setTerminateDialogOpen(false);
        setSelectedStock(null);
        await loadStocks({ force: true });
      } else {
        setSnack({
          open: true,
          message: result.error || 'Failed to terminate stock',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('[SamplingAndStockPage] Failed to terminate stock:', error);
      setSnack({
        open: true,
        message: 'Failed to terminate stock',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  }, [selectedStock, loadStocks]);

  // Handlers - Sampling
  const handleAddSampling = useCallback((stock) => {
    setSelectedStock(stock);
    setSamplingDialogOpen(true);
  }, []);

  const handleCloseSamplingDialog = useCallback(() => {
    setSamplingDialogOpen(false);
    setSelectedStock(null);
  }, []);

  const handleSamplingSubmit = useCallback(async (samplingData) => {
    setSubmitting(true);
    try {
      await samplingUtil.createSampling(samplingData);
      setSnack({
        open: true,
        message: 'Sampling recorded successfully! 📊',
        severity: 'success'
      });
      handleCloseSamplingDialog();

      // Reload stocks to update average weights
      await loadStocks({ force: true });
    } catch (error) {
      console.error('[SamplingAndStockPage] Failed to create sampling:', error);
      setSnack({
        open: true,
        message: `Failed to record sampling: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  }, [handleCloseSamplingDialog, loadStocks]);

  const handleEditSampling = useCallback((sampling, stock) => {
    setSelectedSampling(sampling);
    setSelectedStock(stock);
    setEditSamplingDialogOpen(true);
  }, []);

  const handleEditSamplingSubmit = useCallback(async (updateData) => {
    if (!selectedSampling) return;

    setSubmitting(true);
    try {
      const result = await samplingUtil.updateSampling(
        selectedSampling.sampling_id,
        updateData
      );

      if (result) {
        setSnack({
          open: true,
          message: 'Sampling updated successfully! 📊',
          severity: 'success'
        });
        setEditSamplingDialogOpen(false);
        setSelectedSampling(null);
        setSelectedStock(null);

        // Reload stocks to update with latest sampling data
        await loadStocks({ force: true });
      } else {
        setSnack({
          open: true,
          message: 'Failed to update sampling',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('[SamplingAndStockPage] Failed to update sampling:', error);
      setSnack({
        open: true,
        message: `Failed to update sampling: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  }, [selectedSampling, loadStocks]);

  const handleViewDetails = useCallback((stock) => {
    setSelectedStock(stock);
    setDetailsModalOpen(true);
  }, []);

  const handleSnackClose = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <PageHeader
        title="Stocks & Sampling Management"
        subtitle="Manage fish stocks and track growth through regular sampling"
      />

      {/* Overview Stats */}
      <StockOverviewStats stocks={stocks} loading={loading} />

      {/* Actions & Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddStock}
          sx={{ minWidth: 150 }}
        >
          Add New Stock
        </Button>

        <Box sx={{ flex: 1 }}>
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by species, stock ID, or pond..."
            filters={[
              {
                name: 'status',
                label: 'Status',
                value: statusFilter,
                options: [
                  { value: 'active', label: 'Active' },
                  { value: 'terminated', label: 'Terminated' },
                ],
                onChange: setStatusFilter,
                showAll: true,
                allLabel: 'All',
              },
              {
                name: 'pond',
                label: 'Pond',
                value: pondFilter,
                options: ponds.map(p => ({
                  value: p.pond_id || p.id,
                  label: p.name || p.pond_id || 'Unnamed'
                })),
                onChange: setPondFilter,
                showAll: true,
                allLabel: 'All',
              },
              {
                name: 'species',
                label: 'Species',
                value: speciesFilter,
                options: species.map(s => ({
                  value: s.species_id || s.id,
                  label: s.common_name || s.name || 'Unnamed'
                })),
                onChange: setSpeciesFilter,
                showAll: true,
                allLabel: 'All',
              },
            ]}
            dateRange={{
              startDate,
              endDate,
              onStartDateChange: setStartDate,
              onEndDateChange: setEndDate,
              label: 'Stocking Date Range',
            }}
            onRefresh={() => loadStocks({ force: true })}
            loading={loading}
          />
        </Box>
      </Box>

      {/* Error State */}
      {error && (
        <ErrorState
          message={error}
          onRetry={() => loadStocks({ force: true })}
          compact
        />
      )}

      {/* Loading State */}
      {loading ? (
        <LoadingState message="Loading stocks and samplings..." />
      ) : filteredStocks.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon="🐟"
          message={
            searchTerm
              ? "No stocks found matching your search"
              : stocks.length === 0
              ? "No stocks yet. Add your first stock to begin tracking!"
              : "No stocks match the selected filter"
          }
          action={
            !searchTerm && stocks.length === 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddStock}
                sx={{ mt: 2 }}
              >
                Add First Stock
              </Button>
            )
          }
        />
      ) : (
        /* Stock Cards */
        <Box>
          {filteredStocks.map((stock) => (
            <StockCard
              key={stock.stock_id}
              stock={stock}
              samplings={samplingsByStock[stock.stock_id] || []}
              onAddSampling={handleAddSampling}
              onViewDetails={handleViewDetails}
              onEditSampling={handleEditSampling}
              onTerminate={handleTerminateStock}
            />
          ))}
        </Box>
      )}

      {/* Add Stock Dialog */}
      <Dialog
        open={stockDialogOpen}
        onClose={handleCloseStockDialog}
        maxWidth="md"
        fullWidth
      >
        <StockForm
          onSubmit={handleStockSubmit}
          onCancel={handleCloseStockDialog}
          loading={submitting}
          mode="add"
        />
      </Dialog>

      {/* Add Sampling Dialog */}
      <AddSamplingDialog
        open={samplingDialogOpen}
        onClose={handleCloseSamplingDialog}
        stock={selectedStock}
        onSubmit={handleSamplingSubmit}
        loading={submitting}
      />

      {/* Edit Sampling Dialog */}
      <EditSamplingDialog
        open={editSamplingDialogOpen}
        onClose={() => {
          setEditSamplingDialogOpen(false);
          setSelectedSampling(null);
          setSelectedStock(null);
        }}
        sampling={selectedSampling}
        stock={selectedStock}
        onSubmit={handleEditSamplingSubmit}
        loading={submitting}
      />

      {/* Stock Details Modal */}
      <StockDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedStock(null);
        }}
        stock={selectedStock}
        samplings={selectedStock ? (samplingsByStock[selectedStock.stock_id] || []) : []}
        onEditSampling={handleEditSampling}
      />

      {/* Terminate Stock Dialog */}
      <TerminateStockDialog
        open={terminateDialogOpen}
        onClose={() => {
          setTerminateDialogOpen(false);
          setSelectedStock(null);
        }}
        stock={selectedStock}
        onSubmit={handleTerminateSubmit}
        loading={submitting}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snack.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
