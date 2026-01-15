/**
 * Report Helper Functions
 * Business logic and utilities for report operations.
 *
 * @module utils/helpers/reports
 */

import { REPORT_TYPES, REPORT_CATEGORIES } from '../../constants';

// ============================================================================
// Report Date Range Helpers
// ============================================================================

/**
 * Get date range for report type.
 * @param {string} reportType - Report type
 * @param {Date} baseDate - Base date for calculation (default: now)
 * @returns {Object} { start: Date, end: Date }
 */
export function getReportDateRange(reportType, baseDate = new Date()) {
  const now = new Date(baseDate);
  let start, end;

  switch (reportType) {
    case REPORT_TYPES.DAILY:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;

    case REPORT_TYPES.WEEKLY:
      const dayOfWeek = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    case REPORT_TYPES.MONTHLY:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;

    case REPORT_TYPES.QUARTERLY:
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
      break;

    case REPORT_TYPES.ANNUAL:
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;

    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  return { start, end };
}

/**
 * Format date range for display.
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {string}
 */
export function formatDateRange(start, end) {
  if (!start || !end) return 'N/A';

  const startStr = start.toLocaleDateString();
  const endStr = end.toLocaleDateString();

  if (startStr === endStr) return startStr;
  return `${startStr} - ${endStr}`;
}

// ============================================================================
// Report Data Aggregation
// ============================================================================

/**
 * Aggregate data by date (group items by day/week/month).
 * @param {Array} items - List of items with date field
 * @param {string} dateField - Name of date field
 * @param {string} groupBy - Grouping type ('day', 'week', 'month')
 * @returns {Object} Aggregated data { [key]: items[] }
 */
export function aggregateByDate(items, dateField, groupBy = 'day') {
  const result = {};

  items.forEach((item) => {
    const date = item[dateField] ? new Date(item[dateField]) : null;
    if (!date) return;

    let key;
    switch (groupBy) {
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().slice(0, 10);
    }

    if (!result[key]) result[key] = [];
    result[key].push(item);
  });

  return result;
}

/**
 * Calculate totals from items.
 * @param {Array} items - List of items
 * @param {string} valueField - Field to sum
 * @returns {number}
 */
export function calculateTotal(items, valueField) {
  return items.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0);
}

/**
 * Calculate average from items.
 * @param {Array} items - List of items
 * @param {string} valueField - Field to average
 * @returns {number}
 */
export function calculateAverage(items, valueField) {
  if (items.length === 0) return 0;
  return calculateTotal(items, valueField) / items.length;
}

// ============================================================================
// Report Statistics
// ============================================================================

/**
 * Generate summary statistics for report data.
 * @param {Array} data - Report data items
 * @param {Object} config - Configuration { valueField, groupField }
 * @returns {Object} Summary statistics
 */
export function generateReportSummary(data, config = {}) {
  const { valueField = 'amount', groupField } = config;

  const summary = {
    total: calculateTotal(data, valueField),
    count: data.length,
    average: calculateAverage(data, valueField),
    min: data.length > 0 ? Math.min(...data.map((d) => Number(d[valueField]) || 0)) : 0,
    max: data.length > 0 ? Math.max(...data.map((d) => Number(d[valueField]) || 0)) : 0,
  };

  // Group by field if specified
  if (groupField) {
    summary.byGroup = {};
    data.forEach((item) => {
      const group = item[groupField] || 'Other';
      if (!summary.byGroup[group]) {
        summary.byGroup[group] = { total: 0, count: 0 };
      }
      summary.byGroup[group].total += Number(item[valueField]) || 0;
      summary.byGroup[group].count++;
    });
  }

  return summary;
}

/**
 * Calculate growth/change between periods.
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @returns {Object} { value: number, percentage: number, trend: string }
 */
export function calculateGrowth(current, previous) {
  const value = current - previous;
  const percentage = previous !== 0 ? ((value / previous) * 100) : 0;
  const trend = value > 0 ? 'up' : value < 0 ? 'down' : 'stable';

  return {
    value,
    percentage: Math.round(percentage * 100) / 100,
    trend,
  };
}

// ============================================================================
// Report Filtering
// ============================================================================

/**
 * Filter report data by date range and category.
 * @param {Array} data - Report data
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered data
 */
export function filterReportData(data, filters = {}) {
  const { startDate, endDate, category, searchTerm } = filters;

  return data.filter((item) => {
    // Date filter
    if (startDate || endDate) {
      const itemDate = item.date ? new Date(item.date) : null;
      if (!itemDate) return false;
      if (startDate && itemDate < new Date(startDate)) return false;
      if (endDate && itemDate > new Date(endDate)) return false;
    }

    // Category filter
    if (category && category !== 'all' && item.category !== category) return false;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(term);
      const matchDesc = (item.description || '').toLowerCase().includes(term);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });
}

// ============================================================================
// Report Formatting
// ============================================================================

/**
 * Format report type for display.
 * @param {string} type - Report type
 * @returns {string}
 */
export function formatReportType(type) {
  const types = {
    [REPORT_TYPES.DAILY]: 'Daily Report',
    [REPORT_TYPES.WEEKLY]: 'Weekly Report',
    [REPORT_TYPES.MONTHLY]: 'Monthly Report',
    [REPORT_TYPES.QUARTERLY]: 'Quarterly Report',
    [REPORT_TYPES.ANNUAL]: 'Annual Report',
    [REPORT_TYPES.CUSTOM]: 'Custom Report',
  };
  return types[type] || 'Report';
}

/**
 * Format report category for display.
 * @param {string} category - Report category
 * @returns {string}
 */
export function formatReportCategory(category) {
  const categories = {
    [REPORT_CATEGORIES.PRODUCTION]: 'Production',
    [REPORT_CATEGORIES.FINANCIAL]: 'Financial',
    [REPORT_CATEGORIES.INVENTORY]: 'Inventory',
    [REPORT_CATEGORIES.OPERATIONS]: 'Operations',
  };
  return categories[category] || category;
}

/**
 * Get report period label.
 * @param {string} reportType - Report type
 * @param {Date} date - Date for the period
 * @returns {string}
 */
export function getReportPeriodLabel(reportType, date = new Date()) {
  const d = new Date(date);

  switch (reportType) {
    case REPORT_TYPES.DAILY:
      return d.toLocaleDateString();
    case REPORT_TYPES.WEEKLY:
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return `Week of ${weekStart.toLocaleDateString()}`;
    case REPORT_TYPES.MONTHLY:
      return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    case REPORT_TYPES.QUARTERLY:
      const quarter = Math.floor(d.getMonth() / 3) + 1;
      return `Q${quarter} ${d.getFullYear()}`;
    case REPORT_TYPES.ANNUAL:
      return `${d.getFullYear()}`;
    default:
      return 'Custom Period';
  }
}

