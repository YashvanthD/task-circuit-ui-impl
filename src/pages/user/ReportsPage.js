/**
 * ReportsPage
 * Dynamic, configurable reports dashboard with real API data.
 * Supports adding/removing widgets, charts, tables with DataTable integration.
 *
 * @module pages/user/ReportsPage
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Paper,
  Box,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Drawer,
  Typography,
  Stack,
  Divider,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestoreIcon from '@mui/icons-material/Restore';

// Components
import { PageHeader, StatsGrid } from '../../components/common';
import {
  ReportFilters,
  ChartWidget,
  TableWidget,
  SummaryWidget,
  AddWidgetDialog,
  WidgetConfigDialog,
} from '../../components/reports';

// Contexts
import { useGlobalAlert } from '../../contexts/AlertContext';
import {
  ReportProvider,
  useReportContext,
  WIDGET_TYPES,
  DATA_SOURCES,
} from '../../contexts/ReportContext';

// API
import reportsApi from '../../api/reports';

// Utils
import { processWidgetData, processWidgetSummary } from '../../utils/reportProcessing';

// ============================================================================
// Report Dashboard Content Component
// ============================================================================

function ReportsDashboard() {
  const { showInfo, showSuccess, showError } = useGlobalAlert();
  const {
    widgets,
    visibleWidgets,
    addWidget,
    removeWidget,
    updateWidget,
    toggleWidgetVisibility,
    resetWidgets,
    filters,
    updateFilter,
    resetFilters,
    filterVisibility,
    toggleFilterVisibility,
    dataCache,
    loadingState,
    setDataForSource,
    setLoadingForSource,
    clearDataCache,
  } = useReportContext();

  // Local state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchDataForSource = useCallback(async (source) => {
    setLoadingForSource(source, true);
    try {
      const params = {};
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;
      if (filters.pondId) params.pond_id = filters.pondId;

      let data = [];
      switch (source) {
        case DATA_SOURCES.SAMPLINGS:
          data = await reportsApi.fetchSamplings(params);
          break;
        case DATA_SOURCES.HARVESTS:
          data = await reportsApi.fetchHarvests(params);
          break;
        case DATA_SOURCES.FEEDINGS:
          data = await reportsApi.fetchFeedings(params);
          break;
        case DATA_SOURCES.MORTALITIES:
          data = await reportsApi.fetchMortalities(params);
          break;
        case DATA_SOURCES.EXPENSES:
          data = await reportsApi.fetchExpenses(params);
          break;
        case DATA_SOURCES.PURCHASES:
          data = await reportsApi.fetchPurchases(params);
          break;
        case DATA_SOURCES.TRANSFERS:
          data = await reportsApi.fetchTransfers(params);
          break;
        case DATA_SOURCES.TREATMENTS:
          data = await reportsApi.fetchTreatments(params);
          break;
        case DATA_SOURCES.MAINTENANCE:
          data = await reportsApi.fetchMaintenance(params);
          break;
        default:
          console.warn(`Unknown data source: ${source}`);
      }

      // Ensure data is an array
      let dataArray = [];

      // Robust response parsing
      if (Array.isArray(data)) {
        dataArray = data;
      } else if (data && typeof data === 'object') {
        // Try various locations where the array might be
        if (Array.isArray(data[source])) {
          dataArray = data[source];
        } else if (data.data && Array.isArray(data.data[source])) {
          dataArray = data.data[source];
        } else if (Array.isArray(data.data)) {
          dataArray = data.data;
        } else if (data.data && Array.isArray(data.data.records)) {
            dataArray = data.data.records;
        } else if (data.data && Array.isArray(data.data.items)) {
            dataArray = data.data.items;
        } else if (Array.isArray(data.records)) {
          dataArray = data.records;
        } else if (Array.isArray(data.items)) {
          dataArray = data.items;
        } else if (data.success && data.data && typeof data.data === 'object') {
           // Should we try to guess the key?
           // If source is 'samplings', maybe key is 'samplings'
           // We covered this in data.data[source]
        }
      }

      setDataForSource(source, dataArray);
    } catch (err) {
      console.error(`Error fetching ${source}:`, err);
      setDataForSource(source, []);
    } finally {
      setLoadingForSource(source, false);
    }
  }, [filters, setDataForSource, setLoadingForSource]);

  const fetchAllData = useCallback(async () => {
    setGlobalLoading(true);
    setError(null);

    // Get unique data sources from visible widgets
    const dataSources = [...new Set(
      visibleWidgets
        .filter(w => w.dataSource)
        .map(w => w.dataSource)
    )];

    try {
      await Promise.all(dataSources.map(source => fetchDataForSource(source)));
      showSuccess('Data refreshed successfully');
    } catch (err) {
      setError('Failed to fetch some data');
      showError('Failed to refresh data');
    } finally {
      setGlobalLoading(false);
    }
  }, [visibleWidgets, fetchDataForSource, showSuccess, showError]);

  // Fetch data on mount and filter changes
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.pondId]);

  // ============================================================================
  // Widget Data Processing
  // ============================================================================

  const getWidgetData = useCallback((widget) => {
    if (!widget.dataSource) return [];
    const rawData = dataCache[widget.dataSource] || [];
    return processWidgetData(widget, rawData);
  }, [dataCache]);

  const getWidgetSummary = useCallback((widget) => {
    if (!widget.dataSource) return {};
    const rawData = dataCache[widget.dataSource] || [];
    return processWidgetSummary(widget, rawData);
  }, [dataCache]);

  // ============================================================================
  // Stats Calculation
  // ============================================================================

  const stats = useMemo(() => {
    const samplings = dataCache[DATA_SOURCES.SAMPLINGS] || [];
    const harvests = dataCache[DATA_SOURCES.HARVESTS] || [];
    const expenses = dataCache[DATA_SOURCES.EXPENSES] || [];
    const mortalities = dataCache[DATA_SOURCES.MORTALITIES] || [];

    return [
      { label: 'Total Widgets', value: visibleWidgets.length, color: 'primary.main' },
      { label: 'Samplings', value: samplings.length, color: 'success.main' },
      { label: 'Harvests', value: harvests.length, color: 'info.main' },
      { label: 'Expenses', value: expenses.length, color: 'warning.main' },
      { label: 'Mortalities', value: mortalities.length, color: 'error.main' },
    ];
  }, [visibleWidgets.length, dataCache]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleAddWidget = useCallback((widgetConfig) => {
    const widgetId = addWidget(widgetConfig);
    showSuccess('Widget added successfully');
    // Fetch data for the new widget's source
    if (widgetConfig.dataSource) {
      fetchDataForSource(widgetConfig.dataSource);
    }
    return widgetId;
  }, [addWidget, showSuccess, fetchDataForSource]);

  const handleRemoveWidget = useCallback((widgetId) => {
    removeWidget(widgetId);
    showInfo('Widget removed');
  }, [removeWidget, showInfo]);

  const handleEditWidget = useCallback((widget) => {
    setSelectedWidget(widget);
    setShowConfigDialog(true);
  }, []);

  const handleSaveWidgetConfig = useCallback((updatedWidget) => {
    updateWidget(updatedWidget.id, updatedWidget);
    showSuccess('Widget updated');
    if (updatedWidget.dataSource) {
      fetchDataForSource(updatedWidget.dataSource);
    }
  }, [updateWidget, showSuccess, fetchDataForSource]);

  const handleResetDashboard = useCallback(() => {
    resetWidgets();
    resetFilters();
    clearDataCache();
    showInfo('Dashboard reset to defaults');
    setTimeout(() => fetchAllData(), 100);
  }, [resetWidgets, resetFilters, clearDataCache, showInfo, fetchAllData]);

  // ============================================================================
  // Render Widget
  // ============================================================================

  const renderWidget = useCallback((widget) => {
    const data = getWidgetData(widget);
    const isLoading = loadingState[widget.dataSource] || false;

    const commonProps = {
      key: widget.id,
      title: widget.title,
      subtitle: widget.subtitle,
      loading: isLoading,
      onRemove: () => handleRemoveWidget(widget.id),
      onEdit: () => handleEditWidget(widget),
      onRefresh: () => widget.dataSource && fetchDataForSource(widget.dataSource),
      onHide: () => toggleWidgetVisibility(widget.id),
    };

    switch (widget.type) {
      case WIDGET_TYPES.LINE_CHART:
        return (
          <Grid item xs={12} md={widget.size?.cols || 6} key={widget.id}>
            <ChartWidget
              {...commonProps}
              type="line"
              data={data}
              config={widget.config}
            />
          </Grid>
        );

      case WIDGET_TYPES.BAR_CHART:
        return (
          <Grid item xs={12} md={widget.size?.cols || 6} key={widget.id}>
            <ChartWidget
              {...commonProps}
              type="bar"
              data={data}
              config={widget.config}
            />
          </Grid>
        );

      case WIDGET_TYPES.TABLE:
        return (
          <Grid item xs={12} md={widget.size?.cols || 12} key={widget.id}>
            <TableWidget
              {...commonProps}
              data={data}
              columns={widget.config?.columns}
              config={widget.config}
            />
          </Grid>
        );

      case WIDGET_TYPES.SUMMARY:
        return (
          <Grid item xs={12} md={widget.size?.cols || 6} key={widget.id}>
            <SummaryWidget
              {...commonProps}
              summary={getWidgetSummary(widget)}
              config={widget.config}
            />
          </Grid>
        );

      case WIDGET_TYPES.STAT_CARD:
        // Stats are now rendered in a separate container above
        return null;

      default:
        return null;
    }
  }, [getWidgetData, getWidgetSummary, loadingState, handleRemoveWidget, handleEditWidget, fetchDataForSource, toggleWidgetVisibility]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Paper sx={{ p: 4, maxWidth: 1400, margin: '24px auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <PageHeader
          title="Reports Dashboard"
          subtitle="Configure and view your reports with dynamic widgets"
        />
        <Stack direction="row" spacing={1}>
          <Tooltip title="Add Widget">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddDialog(true)}
            >
              Add Widget
            </Button>
          </Tooltip>
          <Tooltip title="Toggle Filters">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterListIcon color={showFilters ? 'primary' : 'inherit'} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh All Data">
            <IconButton onClick={fetchAllData} disabled={globalLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dashboard Settings">
            <IconButton onClick={() => setShowSettingsDrawer(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      {showFilters && (
        <Box sx={{ mb: 3 }}>
          <ReportFilters
            typeFilter={filters.reportType}
            onTypeChange={(val) => updateFilter('reportType', val)}
            categoryFilter={filters.category}
            onCategoryChange={(val) => updateFilter('category', val)}
            startDate={filters.startDate}
            onStartDateChange={(val) => updateFilter('startDate', val)}
            endDate={filters.endDate}
            onEndDateChange={(val) => updateFilter('endDate', val)}
            onGenerate={() => fetchAllData()}
            onExport={() => showInfo('Export feature coming soon!')}
          />
        </Box>
      )}

      {/* Active Filters Chips */}
      {(filters.startDate || filters.endDate || filters.reportType !== 'all') && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filters.startDate && (
            <Chip
              label={`From: ${filters.startDate}`}
              onDelete={() => updateFilter('startDate', '')}
              size="small"
            />
          )}
          {filters.endDate && (
            <Chip
              label={`To: ${filters.endDate}`}
              onDelete={() => updateFilter('endDate', '')}
              size="small"
            />
          )}
          {filters.reportType !== 'all' && (
            <Chip
              label={`Type: ${filters.reportType}`}
              onDelete={() => updateFilter('reportType', 'all')}
              size="small"
            />
          )}
          <Chip
            label="Clear All"
            onClick={resetFilters}
            size="small"
            variant="outlined"
          />
        </Box>
      )}

      {/* Content Layout */}
      <Stack spacing={4}>
        {/* Quick Stats Section */}
        {visibleWidgets.some(w => w.type === WIDGET_TYPES.STAT_CARD) && (
          <Box>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Overview
              </Typography>
              <StatsGrid stats={stats} columns={5} />
            </Paper>
          </Box>
        )}

        {/* Widgets Grid - Other Widgets */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Report Widgets
          </Typography>
          <Grid container spacing={3}>
            {visibleWidgets.filter(w => w.type !== WIDGET_TYPES.STAT_CARD).length > 0 ? (
              visibleWidgets
                .filter(w => w.type !== WIDGET_TYPES.STAT_CARD)
                .map(renderWidget)
            ) : (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      border: '2px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      No widgets configured
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setShowAddDialog(true)}
                    >
                      Add Your First Widget
                    </Button>
                  </Box>
                </Grid>
            )}
          </Grid>
        </Box>
      </Stack>

      {/* Add Widget Dialog */}
      <AddWidgetDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddWidget}
      />

      {/* Widget Config Dialog */}
      <WidgetConfigDialog
        open={showConfigDialog}
        onClose={() => {
          setShowConfigDialog(false);
          setSelectedWidget(null);
        }}
        widget={selectedWidget}
        onSave={handleSaveWidgetConfig}
      />

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        slotProps={{ paper: { sx: { width: 320 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Dashboard Settings
          </Typography>

          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Widget Visibility
          </Typography>
          <Stack spacing={1}>
            {widgets.map(widget => (
              <FormControlLabel
                key={widget.id}
                control={
                  <Switch
                    checked={widget.visible}
                    onChange={() => toggleWidgetVisibility(widget.id)}
                  />
                }
                label={widget.title}
              />
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Filter Visibility
          </Typography>
          <Stack spacing={1}>
            {Object.entries(filterVisibility).map(([key, filter]) => (
              <FormControlLabel
                key={key}
                control={
                  <Switch
                    checked={filter.visible}
                    onChange={() => toggleFilterVisibility(key)}
                  />
                }
                label={filter.label}
              />
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />
          <Button
            variant="outlined"
            color="warning"
            startIcon={<RestoreIcon />}
            onClick={handleResetDashboard}
            fullWidth
          >
            Reset to Defaults
          </Button>
        </Box>
      </Drawer>
    </Paper>
  );
}

// ============================================================================
// Main Export with Provider
// ============================================================================

export default function ReportsPage() {
  return (
    <ReportProvider>
      <ReportsDashboard />
    </ReportProvider>
  );
}
