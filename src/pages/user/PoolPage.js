import React from 'react';
import { Paper, Typography } from '@mui/material';

export default function PondPage() {
  return (
    <Paper sx={{ padding: 4, maxWidth: 1000, margin: '40px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Pond
      </Typography>
      <Typography variant="body1">
        This is the Pond page. Add your pond-related content here.
      </Typography>
    </Paper>
  );
}
