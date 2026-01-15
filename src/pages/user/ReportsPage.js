/**
 * ReportsPage
 * Generate and view reports.
 * Uses modular components for clean separation.
 *
 * @module pages/user/ReportsPage
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Paper,
  Box,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';

// Components
import {
  PageHeader,
  StatsGrid,
} from '../../components/common';
import {
  ReportList,
  ReportSummary,
  ReportFilters,
  ReportChart,
} from '../../components/reports';

// Utils
import { getReportPeriodLabel } from '../../utils/helpers/reports';

// Constants
import { REPORT_TYPES, REPORT_CATEGORIES } from '../../constants';

export default function ReportsPage() {
  // State
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Snackbar
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  // Mock data for demonstration
  const mockReports = useMemo(() => [
    {
      id: '1',
      title: 'Monthly Production Report',
      type: REPORT_TYPES.MONTHLY,
      category: REPORT_CATEGORIES.PRODUCTION,
      date: new Date().toISOString(),
      summary: 'Total production increased by 15% compared to last month.',
    },
    {
      id: '2',
      title: 'Weekly Financial Summary',
      type: REPORT_TYPES.WEEKLY,
      category: REPORT_CATEGORIES.FINANCIAL,
      date: new Date().toISOString(),
      summary: 'Revenue targets met. Expenses under budget.',
    },
    {
      id: '3',
      title: 'Quarterly Inventory Report',
      type: REPORT_TYPES.QUARTERLY,
      category: REPORT_CATEGORIES.INVENTORY,
      date: new Date().toISOString(),
      summary: 'Stock levels optimal. No critical shortages.',
    },
    {
      id: '4',
      title: 'Daily Operations Log',
      type: REPORT_TYPES.DAILY,
      category: REPORT_CATEGORIES.OPERATIONS,
      date: new Date().toISOString(),
      summary: 'All operations running smoothly.',
    },
  ], []);

  // Sample summary for demonstration
  const mockSummary = useMemo(() => ({
    total: 125000,
    count: 45,
    average: 2777.78,
    min: 500,
    max: 15000,
    growth: { value: 12500, percentage: 11.1, trend: 'up' },
  }), []);

  // Chart data for demonstration
  const chartData = useMemo(() => [
    { label: 'Jan', value: 12000, color: '#4caf50' },
    { label: 'Feb', value: 15000, color: '#2196f3' },
    { label: 'Mar', value: 11000, color: '#ff9800' },
    { label: 'Apr', value: 18000, color: '#9c27b0' },
    { label: 'May', value: 22000, color: '#4caf50' },
    { label: 'Jun', value: 19000, color: '#2196f3' },
  ], []);

  // Quick stats
  const stats = useMemo(() => [
    { label: 'Total Reports', value: mockReports.length, color: 'primary.main' },
    { label: 'Production', value: 12, color: 'success.main' },
    { label: 'Financial', value: 8, color: 'info.main' },
    { label: 'Operations', value: 15, color: 'warning.main' },
    { label: 'This Month', value: 4, color: 'secondary.main' },
  ], [mockReports.length]);

  // Handlers
  const handleGenerateReport = useCallback(() => {
    setSnack({ open: true, message: 'Report generation feature coming soon!', severity: 'info' });
  }, []);

  const handleExport = useCallback(() => {
    setSnack({ open: true, message: 'Export feature coming soon!', severity: 'info' });
  }, []);

  const handleViewReport = useCallback((report) => {
    setSnack({ open: true, message: `Viewing: ${report.title}`, severity: 'info' });
  }, []);

  const handleDownloadReport = useCallback((report) => {
    setSnack({ open: true, message: `Downloading: ${report.title}`, severity: 'info' });
  }, []);

  const handleSnackClose = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, margin: '24px auto' }}>
      {/* Header */}
      <PageHeader
        title="Reports"
        subtitle="Generate, view, and download reports for your operations."
      />

      {/* Stats */}
      <StatsGrid stats={stats} columns={5} />

      {/* Filters */}
      <ReportFilters
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onGenerate={handleGenerateReport}
        onExport={handleExport}
      />

      {/* Summary */}
      <ReportSummary
        summary={mockSummary}
        title="Financial Summary"
        period={getReportPeriodLabel(REPORT_TYPES.MONTHLY)}
      />

      {/* Chart */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <ReportChart
              data={chartData}
              title="Monthly Revenue Trend"
              height={200}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ReportChart
              data={[
                { label: 'Production', value: 45, color: '#4caf50' },
                { label: 'Financial', value: 30, color: '#2196f3' },
                { label: 'Operations', value: 25, color: '#ff9800' },
              ]}
              title="Reports by Category"
              height={200}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Report List */}
      <ReportList
        reports={mockReports}
        loading={loading}
        onView={handleViewReport}
        onDownload={handleDownloadReport}
      />

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
