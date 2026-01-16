import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, MenuItem, Stack } from '@mui/material';
import { apiFetch, API_POND } from '../../../api';

/**
 * AddPondForm - Form to add a new pond
 * Fields: pond_name, type, length, width, depth, location_lat, location_lan, description, tag, env
 */
const pondTypes = ['Fish', 'Pet', 'Other'];
const envOptions = ['Outdoor', 'Indoor', 'Pond', 'Aquarium'];

export default function AddPondForm() {
  const [form, setForm] = useState({
    pond_name: '',
    type: '',
    length: '',
    width: '',
    depth: '',
    location_lat: '',
    location_lan: '',
    description: '',
    tag: '',
    env: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.pond_name || !form.type || !form.length || !form.width || !form.depth) {
      setError('All required fields must be filled');
      return;
    }
    try {
      const res = await apiFetch(API_POND.CREATE, {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Pond added successfully!');
      } else {
        setError(data.error || 'Failed to add pond');
      }
    } catch (err) {
      setError('Network/server error');
    }
  };

  return (
    <Paper elevation={3} sx={{padding:4, maxWidth:500, margin:'80px auto'}}>
      <Typography variant="h6" gutterBottom>Add Pond</Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField label="Pond Name" name="pond_name" variant="outlined" fullWidth margin="normal" value={form.pond_name} onChange={handleChange} required />
        <TextField select label="Type" name="type" variant="outlined" fullWidth margin="normal" value={form.type} onChange={handleChange} required>
          {pondTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
        </TextField>
        <Stack direction="row" spacing={2} sx={{mb:2}}>
          <TextField label="Length (m)" name="length" type="number" variant="outlined" value={form.length} onChange={handleChange} required sx={{flex:1}} />
          <TextField label="Width (m)" name="width" type="number" variant="outlined" value={form.width} onChange={handleChange} required sx={{flex:1}} />
          <TextField label="Depth (m)" name="depth" type="number" variant="outlined" value={form.depth} onChange={handleChange} required sx={{flex:1}} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{mb:2}}>
          <TextField label="Latitude" name="location_lat" type="number" variant="outlined" value={form.location_lat} onChange={handleChange} sx={{flex:1}} />
          <TextField label="Longitude" name="location_lan" type="number" variant="outlined" value={form.location_lan} onChange={handleChange} sx={{flex:1}} />
        </Stack>
        <TextField label="Description" name="description" variant="outlined" fullWidth margin="normal" value={form.description} onChange={handleChange} />
        <TextField label="Tag" name="tag" variant="outlined" fullWidth margin="normal" value={form.tag} onChange={handleChange} />
        <TextField select label="Environment" name="env" variant="outlined" fullWidth margin="normal" value={form.env} onChange={handleChange} required>
          {envOptions.map(env => <MenuItem key={env} value={env}>{env}</MenuItem>)}
        </TextField>
        {error && <Typography color="error" mt={2}>{error}</Typography>}
        {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        <Button variant="contained" color="primary" fullWidth sx={{mt:2}} type="submit">Add Pond</Button>
      </Box>
    </Paper>
  );
}
