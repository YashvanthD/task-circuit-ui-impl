/**
 * ReportContext
 * Context for managing report configurations, widgets, and user preferences.
 * Supports dynamic widget management and configuration persistence.
 *
 * @module contexts/ReportContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

// ============================================================================
// Types & Defaults
// ============================================================================

/**
 * Widget types available for reports
 */
export const WIDGET_TYPES = {
  BAR_CHART: 'bar_chart',
  LINE_CHART: 'line_chart',
  PIE_CHART: 'pie_chart',
  TABLE: 'table',
  STAT_CARD: 'stat_card',
  SUMMARY: 'summary',
};

/**
 * Data source types for widgets
 */
export const DATA_SOURCES = {
  SAMPLINGS: 'samplings',
  HARVESTS: 'harvests',
  FEEDINGS: 'feedings',
  MORTALITIES: 'mortalities',
  EXPENSES: 'expenses',
  PURCHASES: 'purchases',
  TRANSFERS: 'transfers',
  TREATMENTS: 'treatments',
  MAINTENANCE: 'maintenance',
};

/**
 * Default widget configurations
 */
export const DEFAULT_WIDGETS = [
  {
    id: 'stats-overview',
    type: WIDGET_TYPES.STAT_CARD,
    title: 'Quick Stats',
    dataSource: null, // Computed from multiple sources
    size: { cols: 12, rows: 1 },
    visible: true,
    order: 0,
  },
  {
    id: 'sampling-trend',
    type: WIDGET_TYPES.LINE_CHART,
    title: 'Sampling Trend',
    dataSource: DATA_SOURCES.SAMPLINGS,
    config: {
      xKey: 'date',
      lines: [{ key: 'value', name: 'Samples', color: '#4caf50' }],
    },
    size: { cols: 8, rows: 2 },
    visible: true,
    order: 1,
  },
  {
    id: 'harvest-chart',
    type: WIDGET_TYPES.BAR_CHART,
    title: 'Harvest by Pond',
    dataSource: DATA_SOURCES.HARVESTS,
    config: {
      xKey: 'pond_name',
      bars: [{ key: 'total_weight', name: 'Weight (kg)', color: '#2196f3' }],
    },
    size: { cols: 4, rows: 2 },
    visible: true,
    order: 2,
  },
  {
    id: 'expense-table',
    type: WIDGET_TYPES.TABLE,
    title: 'Recent Expenses',
    dataSource: DATA_SOURCES.EXPENSES,
    config: {
      columns: [
        { id: 'description', label: 'Description' },
        { id: 'amount', label: 'Amount', align: 'right' },
        { id: 'category', label: 'Category' },
        { id: 'created_at', label: 'Date' },
      ],
    },
    size: { cols: 6, rows: 2 },
    visible: true,
    order: 3,
  },
  {
    id: 'mortality-summary',
    type: WIDGET_TYPES.SUMMARY,
    title: 'Mortality Summary',
    dataSource: DATA_SOURCES.MORTALITIES,
    config: {
      valueField: 'count',
    },
    size: { cols: 6, rows: 2 },
    visible: true,
    order: 4,
  },
];

/**
 * Available filter configurations
 */
export const FILTER_CONFIGS = {
  dateRange: { id: 'dateRange', label: 'Date Range', type: 'dateRange', visible: true },
  reportType: { id: 'reportType', label: 'Report Type', type: 'select', visible: true },
  category: { id: 'category', label: 'Category', type: 'select', visible: true },
  pond: { id: 'pond', label: 'Pond', type: 'select', visible: true },
  species: { id: 'species', label: 'Species', type: 'select', visible: false },
  status: { id: 'status', label: 'Status', type: 'select', visible: false },
};

// ============================================================================
// Context
// ============================================================================

const ReportContext = createContext(null);

export function useReportContext() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReportContext must be used within a ReportProvider');
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

export function ReportProvider({ children }) {
  // ---- Widget State ----
  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem('report_widgets');
      return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  // ---- Filter State ----
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    reportType: 'all',
    category: 'all',
    pondId: null,
    speciesId: null,
    status: 'all',
  });

  // ---- Filter Visibility State ----
  const [filterVisibility, setFilterVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem('report_filter_visibility');
      return saved ? JSON.parse(saved) : FILTER_CONFIGS;
    } catch {
      return FILTER_CONFIGS;
    }
  });

  // ---- Data Cache State ----
  const [dataCache, setDataCache] = useState({});
  const [loadingState, setLoadingState] = useState({});

  // Persist widgets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('report_widgets', JSON.stringify(widgets));
    } catch (e) {
      console.warn('Failed to save widgets:', e);
    }
  }, [widgets]);

  // Persist filter visibility to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('report_filter_visibility', JSON.stringify(filterVisibility));
    } catch (e) {
      console.warn('Failed to save filter visibility:', e);
    }
  }, [filterVisibility]);

  // ---- Widget Management ----

  const addWidget = useCallback((widget) => {
    const newWidget = {
      ...widget,
      id: widget.id || `widget-${Date.now()}`,
      visible: true,
      order: widgets.length,
    };
    setWidgets(prev => [...prev, newWidget]);
    return newWidget.id;
  }, [widgets.length]);

  const removeWidget = useCallback((widgetId) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  }, []);

  const updateWidget = useCallback((widgetId, updates) => {
    setWidgets(prev => prev.map(w =>
      w.id === widgetId ? { ...w, ...updates } : w
    ));
  }, []);

  const toggleWidgetVisibility = useCallback((widgetId) => {
    setWidgets(prev => prev.map(w =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  }, []);

  const reorderWidgets = useCallback((sourceIndex, destIndex) => {
    setWidgets(prev => {
      const result = [...prev];
      const [removed] = result.splice(sourceIndex, 1);
      result.splice(destIndex, 0, removed);
      return result.map((w, i) => ({ ...w, order: i }));
    });
  }, []);

  const resetWidgets = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.removeItem('report_widgets');
  }, []);

  // ---- Filter Management ----

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      startDate: '',
      endDate: '',
      reportType: 'all',
      category: 'all',
      pondId: null,
      speciesId: null,
      status: 'all',
    });
  }, []);

  const toggleFilterVisibility = useCallback((filterId) => {
    setFilterVisibility(prev => ({
      ...prev,
      [filterId]: {
        ...prev[filterId],
        visible: !prev[filterId]?.visible,
      },
    }));
  }, []);

  const resetFilterVisibility = useCallback(() => {
    setFilterVisibility(FILTER_CONFIGS);
    localStorage.removeItem('report_filter_visibility');
  }, []);

  // ---- Data Management ----

  const setDataForSource = useCallback((source, data) => {
    setDataCache(prev => ({ ...prev, [source]: data }));
  }, []);

  const setLoadingForSource = useCallback((source, loading) => {
    setLoadingState(prev => ({ ...prev, [source]: loading }));
  }, []);

  const clearDataCache = useCallback(() => {
    setDataCache({});
    setLoadingState({});
  }, []);

  // ---- Computed Values ----

  const visibleWidgets = useMemo(() =>
    widgets.filter(w => w.visible).sort((a, b) => a.order - b.order),
    [widgets]
  );

  const visibleFilters = useMemo(() =>
    Object.values(filterVisibility).filter(f => f.visible),
    [filterVisibility]
  );

  // ---- Context Value ----

  const value = useMemo(() => ({
    // Widgets
    widgets,
    visibleWidgets,
    addWidget,
    removeWidget,
    updateWidget,
    toggleWidgetVisibility,
    reorderWidgets,
    resetWidgets,

    // Filters
    filters,
    updateFilter,
    resetFilters,
    filterVisibility,
    visibleFilters,
    toggleFilterVisibility,
    resetFilterVisibility,

    // Data
    dataCache,
    loadingState,
    setDataForSource,
    setLoadingForSource,
    clearDataCache,

    // Constants
    WIDGET_TYPES,
    DATA_SOURCES,
  }), [
    widgets,
    visibleWidgets,
    addWidget,
    removeWidget,
    updateWidget,
    toggleWidgetVisibility,
    reorderWidgets,
    resetWidgets,
    filters,
    updateFilter,
    resetFilters,
    filterVisibility,
    visibleFilters,
    toggleFilterVisibility,
    resetFilterVisibility,
    dataCache,
    loadingState,
    setDataForSource,
    setLoadingForSource,
    clearDataCache,
  ]);

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
}

export default ReportContext;
