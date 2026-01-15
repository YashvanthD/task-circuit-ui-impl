/**
 * ReportList Component
 * Renders a list of report cards.
 *
 * @module components/reports/ReportList
 */

import React from 'react';
import { Grid, Typography, CircularProgress, Stack } from '@mui/material';
import ReportCard from './ReportCard';

/**
 * ReportList - Renders a list of reports.
 *
 * @param {Object} props
 * @param {Array} props.reports - List of reports
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onView - View handler
 * @param {Function} props.onDownload - Download handler
 * @param {boolean} props.compact - Compact view mode
 */
export default function ReportList({
  reports = [],
  loading = false,
  onView,
  onDownload,
  compact = false,
}) {
  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Loading reports...
        </Typography>
      </Stack>
    );
  }

  if (reports.length === 0) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          📊
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No reports found.
        </Typography>
      </Stack>
    );
  }

  if (compact) {
    return (
      <Stack spacing={2}>
        {reports.map((report) => (
          <ReportCard
            key={report.id || report.report_id}
            report={report}
            onView={onView}
            onDownload={onDownload}
            compact
          />
        ))}
      </Stack>
    );
  }

  return (
    <Grid container spacing={3}>
      {reports.map((report) => (
        <Grid item xs={12} sm={6} md={4} key={report.id || report.report_id}>
          <ReportCard
            report={report}
            onView={onView}
            onDownload={onDownload}
          />
        </Grid>
      ))}
    </Grid>
  );
}

