import React, { useState } from 'react';
import { Paper, Typography, TextField, Stack, Button } from '@mui/material';

export default function FishForm({ initialData = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    common_name: initialData.common_name || '',
    scientific_name: initialData.scientific_name || '',
    count: initialData.count || 0,
    ponds: initialData.ponds ? (Array.isArray(initialData.ponds) ? initialData.ponds.join(', ') : String(initialData.ponds)) : '',
    capture_date: initialData.capture_date || '',
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    const out = { ...form, ponds: form.ponds ? form.ponds.split(',').map(s => s.trim()) : [] };
    if (onSubmit) onSubmit(out);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Fish</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField label="Common name" name="common_name" value={form.common_name} onChange={handleChange} fullWidth />
          <TextField label="Scientific name" name="scientific_name" value={form.scientific_name} onChange={handleChange} fullWidth />
          <TextField label="Count" name="count" value={form.count} onChange={handleChange} fullWidth />
          <TextField label="Ponds (comma separated)" name="ponds" value={form.ponds} onChange={handleChange} fullWidth />
          <TextField label="Capture date" name="capture_date" value={form.capture_date} onChange={handleChange} fullWidth />
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onCancel}>Cancel</Button>
            <Button variant="contained" type="submit">Save</Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}

