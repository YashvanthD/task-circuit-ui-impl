/**
 * Reports API Module
 * Report-related API calls for fetching aggregated data from various endpoints.
 *
 * @module api/reports
 */

import { apiFetch } from './client';
import { getAuthHeaders } from './auth';
import { API_FISH, API_EXPENSE, API_POND } from './constants';

// ============================================================================
// Report API Constants
// ============================================================================
export const API_REPORT = {
  // Aggregated from existing endpoints
  SAMPLINGS: API_FISH.SAMPLINGS,
  HARVESTS: API_FISH.HARVESTS,
  FEEDINGS: API_FISH.FEEDINGS,
  MORTALITIES: API_FISH.MORTALITIES,
  PURCHASES: API_FISH.PURCHASES,
  TRANSFERS: API_FISH.TRANSFERS,
  MAINTENANCE: API_FISH.MAINTENANCE,
  TREATMENTS: API_FISH.TREATMENTS,
  EXPENSES: API_EXPENSE.LIST,
  PONDS: API_POND.LIST,
};

// ============================================================================
// Data Fetching Functions
// ============================================================================

/**
 * Fetch samplings data for reports
 * @param {Object} params - Query parameters (start_date, end_date, pond_id, etc.)
 */
export async function fetchSamplings(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_REPORT.SAMPLINGS}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Fetch harvests data for reports
 */
export async function fetchHarvests(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_REPORT.HARVESTS}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Fetch feedings data for reports
 */
export async function fetchFeedings(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_REPORT.FEEDINGS}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Fetch mortalities data for reports
 */
export async function fetchMortalities(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_REPORT.MORTALITIES}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Fetch expenses data for reports
 */
export async function fetchExpenses(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_REPORT.EXPENSES}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Fetch purchases data for reports
 */
export async function fetchPurchases(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_REPORT.PURCHASES}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Fetch ponds data for reports
 */
export async function fetchPonds(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_REPORT.PONDS}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Fetch transfers data for reports
 */
export async function fetchTransfers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_REPORT.TRANSFERS}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Fetch treatments data for reports
 */
export async function fetchTreatments(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_REPORT.TREATMENTS}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Fetch maintenance data for reports
 */
export async function fetchMaintenance(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_REPORT.MAINTENANCE}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

// ============================================================================
// Aggregation Helpers
// ============================================================================

/**
 * Aggregate data by date for time-series charts
 * @param {Array} data - Raw data array
 * @param {string} dateField - Field name containing date
 * @param {string} valueField - Field name containing value to aggregate
 * @param {string} aggregation - Aggregation type: 'sum', 'count', 'avg'
 */
export function aggregateByDate(data, dateField = 'created_at', valueField = null, aggregation = 'count') {
  const grouped = {};

  data.forEach(item => {
    const date = new Date(item[dateField]).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = { items: [], sum: 0, count: 0 };
    }
    grouped[date].items.push(item);
    grouped[date].count += 1;
    if (valueField && item[valueField]) {
      grouped[date].sum += parseFloat(item[valueField]) || 0;
    }
  });

  return Object.entries(grouped).map(([date, { items, sum, count }]) => ({
    date,
    value: aggregation === 'sum' ? sum : aggregation === 'avg' ? (sum / count) : count,
    count,
    sum,
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Aggregate data by category
 */
export function aggregateByCategory(data, categoryField, valueField = null) {
  const grouped = {};

  data.forEach(item => {
    const category = item[categoryField] || 'Unknown';
    if (!grouped[category]) {
      grouped[category] = { count: 0, sum: 0 };
    }
    grouped[category].count += 1;
    if (valueField && item[valueField]) {
      grouped[category].sum += parseFloat(item[valueField]) || 0;
    }
  });

  return Object.entries(grouped).map(([category, { count, sum }]) => ({
    category,
    count,
    sum,
    value: valueField ? sum : count,
  }));
}

/**
 * Calculate summary statistics
 */
export function calculateSummary(data, valueField = null) {
  if (!data || data.length === 0) {
    return { total: 0, count: 0, average: 0, min: 0, max: 0 };
  }

  const values = valueField
    ? data.map(item => parseFloat(item[valueField]) || 0)
    : data.map((_, i) => i + 1);

  const sum = values.reduce((a, b) => a + b, 0);
  const count = values.length;

  return {
    total: sum,
    count,
    average: count > 0 ? sum / count : 0,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

// ============================================================================
// Report Generation
// ============================================================================

/**
 * Generate a comprehensive report from multiple data sources
 * @param {Object} options - Report options
 * @param {string} options.startDate - Start date filter
 * @param {string} options.endDate - End date filter
 * @param {string} options.reportType - Type of report (sampling, harvest, financial, etc.)
 */
export async function generateReport({ startDate, endDate, reportType, pondId }) {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (pondId) params.pond_id = pondId;

  const fetchFunctions = {
    sampling: fetchSamplings,
    harvest: fetchHarvests,
    feeding: fetchFeedings,
    mortality: fetchMortalities,
    expense: fetchExpenses,
    purchase: fetchPurchases,
    transfer: fetchTransfers,
    treatment: fetchTreatments,
    maintenance: fetchMaintenance,
  };

  const fetchFn = fetchFunctions[reportType];
  if (!fetchFn) {
    throw new Error(`Unknown report type: ${reportType}`);
  }

  return fetchFn(params);
}

// ============================================================================
// Default Export
// ============================================================================

const reportsApi = {
  fetchSamplings,
  fetchHarvests,
  fetchFeedings,
  fetchMortalities,
  fetchExpenses,
  fetchPurchases,
  fetchPonds,
  fetchTransfers,
  fetchTreatments,
  fetchMaintenance,
  generateReport,
  aggregateByDate,
  aggregateByCategory,
  calculateSummary,
};

export default reportsApi;
