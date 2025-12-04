import React from 'react';
import { Paper, Typography } from '@mui/material';

export default function ReportsPage() {
  return (
    <Paper sx={{ padding: 4, maxWidth: 1000, margin: '40px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Reports
      </Typography>
      <Typography variant="body1">
        This is the Reports page. Add your reports-related content here.
      </Typography>
    </Paper>
  );
}

