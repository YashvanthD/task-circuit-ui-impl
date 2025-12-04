import React from 'react';
import { Paper, Typography, Button, Stack } from '@mui/material';

export default function DatasetPage() {
  return (
    <Paper sx={{ padding: 4, maxWidth: 1000, margin: '40px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dataset
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Create and manage new kinds of fish and pets in the database.
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" color="primary">Add New Fish</Button>
        <Button variant="contained" color="secondary">Add New Pet</Button>
      </Stack>
    </Paper>
  );
}

