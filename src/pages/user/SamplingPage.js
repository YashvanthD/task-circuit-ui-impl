import React, { useState } from 'react';
import { Paper, Typography, Button, Grid, Dialog } from '@mui/material';
import SamplingForm from '../../forms/SamplingForm';
import Sampling from '../../components/Sampling';

export default function SamplingPage() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); };
  const handleSubmit = (data) => {
    // For now, just log; this should call sampling util API when available
    console.log('Sampling submitted', data);
    handleClose();
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1000, margin: '24px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Sampling</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>Record fish sampling events (weight, count, location) to update stock/estimates.</Typography>
      <Button variant="contained" onClick={handleOpen}>New Sampling</Button>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Sampling />
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <SamplingForm onSubmit={handleSubmit} onCancel={handleClose} />
      </Dialog>
    </Paper>
  );
}
