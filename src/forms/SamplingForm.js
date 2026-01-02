import React, { useState } from 'react';
import { Paper, Typography, TextField, Stack, Button } from '@mui/material';

export default function SamplingForm({ initialData = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    pond_id: initialData.pond_id || '',
    species: initialData.species || '',
    count: initialData.count || 0,
    avg_weight: initialData.avg_weight || 0,
    notes: initialData.notes || '',
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); if (onSubmit) onSubmit(form); };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">New Sampling</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField label="Pond ID" name="pond_id" value={form.pond_id} onChange={handleChange} fullWidth />
          <TextField label="Species" name="species" value={form.species} onChange={handleChange} fullWidth />
          <TextField label="Count" name="count" value={form.count} onChange={handleChange} fullWidth />
          <TextField label="Avg weight (g)" name="avg_weight" value={form.avg_weight} onChange={handleChange} fullWidth />
          <TextField label="Notes" name="notes" value={form.notes} onChange={handleChange} fullWidth multiline rows={3} />
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onCancel}>Cancel</Button>
            <Button variant="contained" type="submit">Save</Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}

