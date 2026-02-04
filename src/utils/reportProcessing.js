/**
 * Report Processing Utilities
 * Separates data transformation logic from UI components.
 *
 * @module utils/reportProcessing
 */

import { aggregateByDate, aggregateByCategory, calculateSummary } from '../api/reports';

// We replicate these constants or import them to avoid circular dependencies
// Ideally these should be in a shared constants file, but for now we match the strings
const WIDGET_TYPES = {
  BAR_CHART: 'bar_chart',
  LINE_CHART: 'line_chart',
  PIE_CHART: 'pie_chart',
  TABLE: 'table',
  STAT_CARD: 'stat_card',
  SUMMARY: 'summary',
};

/**
 * Process raw data for a specific widget type
 * @param {Object} widget - Widget configuration object
 * @param {Array} rawData - Raw data array from API
 * @returns {Array|Object} Processed data suitable for the widget
 */
export function processWidgetData(widget, rawData = []) {
  if (!Array.isArray(rawData) || rawData.length === 0) return [];

  // If data items are not Models, we could wrap them here if needed
  // const data = rawData.map(item => new BaseModel(item));
  // But for performance on large reports, we stick to raw data unless needed.

  switch (widget.type) {
    case WIDGET_TYPES.LINE_CHART:
      // Aggregate by date for trend lines
      // Defaults: x=created_at, value=count
      return aggregateByDate(
        rawData,
        widget.config?.xKey || 'created_at',
        widget.config?.valueField,
        widget.config?.aggregation || 'count'
      );

    case WIDGET_TYPES.BAR_CHART:
      // Aggregate by category for comparisons
      // Defaults: x=pond_name, value=count
      return aggregateByCategory(
        rawData,
        widget.config?.xKey || 'pond_name',
        widget.config?.valueField
      );

    case WIDGET_TYPES.TABLE:
      // Tables display raw data (optionally filtered/sorted by DataTable component)
      return rawData;

    case WIDGET_TYPES.SUMMARY:
      // Summaries calc stats, but usually displayed via processWidgetSummary
      // If the widget expects an array (e.g. list of stats), we return rawData
      return rawData;

    default:
      return rawData;
  }
}

/**
 * Calculate summary statistics for a widget
 * @param {Object} widget - Widget configuration object
 * @param {Array} rawData - Raw data array
 * @returns {Object} Summary object { total, count, average, min, max }
 */
export function processWidgetSummary(widget, rawData = []) {
  return calculateSummary(rawData, widget.config?.valueField);
}
