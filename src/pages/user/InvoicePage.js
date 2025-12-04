import React from 'react';
import { Paper, Typography } from '@mui/material';

export default function InvoicePage() {
  return (
    <Paper sx={{ padding: 4, maxWidth: 1000, margin: '40px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Invoice
      </Typography>
      <Typography variant="body1">
        This is the Invoice page. Add your invoice management features here.
      </Typography>
    </Paper>
  );
}
