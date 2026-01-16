import React, { useState } from 'react';
import { Paper, Typography, Button, TextField, Stack } from '@mui/material';

export default function PondDailyUpdateForm({ initialData = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialData);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };
  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, margin: '40px auto' }}>
      <Typography variant="h5" gutterBottom>Pond Daily Update</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField label="Date" name="date" value={form.date || ''} onChange={handleChange} fullWidth required />
          <TextField label="Pond ID/Location" name="pond_id" value={form.pond_id || ''} onChange={handleChange} fullWidth required />
          <TextField label="Water Temperature (°C)" name="water_temperature" value={form.water_temperature || ''} onChange={handleChange} fullWidth />
          <TextField label="Dissolved Oxygen (mg/L)" name="dissolved_oxygen" value={form.dissolved_oxygen || ''} onChange={handleChange} fullWidth />
          <TextField label="pH" name="ph" value={form.ph || ''} onChange={handleChange} fullWidth />
          <TextField label="Feed Amount" name="feed_amount" value={form.feed_amount || ''} onChange={handleChange} fullWidth />
          <TextField label="Mortality" name="mortality" value={form.mortality || ''} onChange={handleChange} fullWidth />
          <TextField label="Staff Name" name="staff_name" value={form.staff_name || ''} onChange={handleChange} fullWidth />
          <Button variant="contained" color="primary" type="submit">Submit Update</Button>
          <Button variant="outlined" color="secondary" onClick={onCancel}>Cancel</Button>
        </Stack>
      </form>
    </Paper>
  );
}
