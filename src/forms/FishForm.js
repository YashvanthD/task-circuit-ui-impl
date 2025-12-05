import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, TextField, Button, Box, Grid, MenuItem, InputLabel, FormControl, Select, Stack, IconButton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Button as MuiButton } from '@mui/material';

const initialForm = {
  // 1. Fishery / Catch Information
  capture_date: '',
  capture_time: '',
  vessel_name: '',
  gear_type: '',
  fishing_location: '',
  depth: '',
  water_temp: '',
  salinity: '',
  // 2. Fish Biological Data
  common_name: '',
  scientific_name: '',
  local_name: '',
  species_code: '',
  count: '',
  total_length: '',
  fork_length: '',
  standard_length: '',
  weight: '',
  sex: '',
  maturity_stage: '',
  gonad_condition: '',
  life_stage: '',
  stomach_fullness: '',
  abnormalities: '',
  health_score: '',
  // 3. Catch Use / Disposition
  disposition: '',
  catch_type: '',
  processing_method: '',
  bycatch: '',
  // 4. Photo / Other Attachments
  specimen_photo: null,
  site_photo: null,
  // 5. Reporting Information
  observer_name: '',
  affiliation: '',
  form_number: '',
  sample_id: '',
};

const sexOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'indeterminate', label: 'Indeterminate' },
  { value: 'unknown', label: 'Unknown' },
];
const maturityOptions = [
  'immature', 'mature', 'spawning', 'spent'
];
const lifeStageOptions = [
  'larvae', 'juvenile', 'adult'
];
const dispositionOptions = [
  'kept', 'released', 'discarded'
];
const catchTypeOptions = [
  'commercial', 'subsistence', 'recreational'
];
const processingOptions = [
  'whole', 'gutted', 'filleted', 'other'
];
const bycatchOptions = [
  'bycatch', 'target'
];

export default function FishForm({ onSubmit, initialData, onCancel }) {
  const [form, setForm] = useState(initialData || initialForm);
  const [customFields, setCustomFields] = useState(initialData?.customFields || []);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newField, setNewField] = useState({ key: '', value: '' });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setCustomFields(initialData.customFields || []);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleCustomFieldChange = (idx, field, value) => {
    setCustomFields(fields => fields.map((f, i) => i === idx ? { ...f, [field]: value } : f));
  };

  const handleAddCustomField = () => {
    if (!newField.key) return;
    setCustomFields(fields => [...fields, { ...newField }]);
    setNewField({ key: '', value: '' });
  };

  const handleRemoveCustomField = (idx) => {
    setCustomFields(fields => fields.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Basic validation
    if (!form.common_name || !form.capture_date) {
      setError('Common Name and Capture Date are required');
      return;
    }
    // onSubmit can be used to send data to API
    if (onSubmit) {
      onSubmit({ ...form, customFields });
      setSuccess('Fish data submitted!');
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 900, margin: '40px auto', overflowY: 'auto', scrollBehavior: 'smooth', maxHeight: '80vh', bgcolor: '#f8f9fa' }}>
      <Typography variant="h5" gutterBottom>
        {form.common_name ? `${form.common_name} Data` : 'Fish Data Entry'}
      </Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Fishery / Catch Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField label="Date of Capture" name="capture_date" type="date" InputLabelProps={{ shrink: true }} fullWidth value={form.capture_date} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Time of Capture" name="capture_time" type="time" InputLabelProps={{ shrink: true }} fullWidth value={form.capture_time} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Vessel Name / ID" name="vessel_name" fullWidth value={form.vessel_name} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Gear Type" name="gear_type" fullWidth value={form.gear_type} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Fishing Location (GPS/Area/Map)" name="fishing_location" fullWidth value={form.fishing_location} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Depth (m)" name="depth" type="number" fullWidth value={form.depth} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Water Temperature" name="water_temp" type="number" fullWidth value={form.water_temp} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Salinity" name="salinity" type="number" fullWidth value={form.salinity} onChange={handleChange} /></Grid>
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Fish Biological Data</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField label="Common Name" name="common_name" fullWidth value={form.common_name} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Scientific Name" name="scientific_name" fullWidth value={form.scientific_name} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Local Name" name="local_name" fullWidth value={form.local_name} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Species Code / FAO Code" name="species_code" fullWidth value={form.species_code} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Number of Individuals" name="count" type="number" fullWidth value={form.count} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Total Length (cm)" name="total_length" type="number" fullWidth value={form.total_length} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Fork Length" name="fork_length" type="number" fullWidth value={form.fork_length} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Standard Length" name="standard_length" type="number" fullWidth value={form.standard_length} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Weight (g or kg)" name="weight" type="number" fullWidth value={form.weight} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Sex</InputLabel>
                <Select name="sex" value={form.sex} label="Sex" onChange={handleChange} variant="outlined" MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}>
                  {sexOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Maturity Stage</InputLabel>
                <Select name="maturity_stage" value={form.maturity_stage} label="Maturity Stage" onChange={handleChange} variant="outlined" MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}>
                  {maturityOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}><TextField label="Gonad Condition / Phase" name="gonad_condition" fullWidth value={form.gonad_condition} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Life Stage</InputLabel>
                <Select name="life_stage" value={form.life_stage} label="Life Stage" onChange={handleChange} variant="outlined" MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}>
                  {lifeStageOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}><TextField label="Stomach Fullness / Diet" name="stomach_fullness" fullWidth value={form.stomach_fullness} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="External Abnormalities / Parasites" name="abnormalities" fullWidth value={form.abnormalities} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Condition Factor / Health Score" name="health_score" fullWidth value={form.health_score} onChange={handleChange} /></Grid>
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Catch Use / Disposition</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Kept / Released / Discarded</InputLabel>
                <Select name="disposition" value={form.disposition} label="Kept / Released / Discarded" onChange={handleChange} variant="outlined">
                  {dispositionOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Catch Type</InputLabel>
                <Select name="catch_type" value={form.catch_type} label="Catch Type" onChange={handleChange} variant="outlined">
                  {catchTypeOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Processing Method</InputLabel>
                <Select name="processing_method" value={form.processing_method} label="Processing Method" onChange={handleChange} variant="outlined">
                  {processingOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Bycatch / Target</InputLabel>
                <Select name="bycatch" value={form.bycatch} label="Bycatch / Target" onChange={handleChange} variant="outlined">
                  {bycatchOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Photo / Other Attachments</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button variant="outlined" component="label" fullWidth sx={{ minHeight: 56 }}>
                Upload Specimen Photo
                <input type="file" name="specimen_photo" accept="image/*" hidden onChange={handleChange} />
              </Button>
              {form.specimen_photo && <Typography variant="caption">{form.specimen_photo.name}</Typography>}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button variant="outlined" component="label" fullWidth sx={{ minHeight: 56 }}>
                Upload Catch Site Photo
                <input type="file" name="site_photo" accept="image/*" hidden onChange={handleChange} />
              </Button>
              {form.site_photo && <Typography variant="caption">{form.site_photo.name}</Typography>}
            </Grid>
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Reporting Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField label="Observer / Fisher’s Name" name="observer_name" fullWidth value={form.observer_name} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Affiliation / Agency" name="affiliation" fullWidth value={form.affiliation} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Form Number" name="form_number" fullWidth value={form.form_number} onChange={handleChange} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Sample ID" name="sample_id" fullWidth value={form.sample_id} onChange={handleChange} /></Grid>
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Custom Fields</Typography>
          <Grid container spacing={2} alignItems="center">
            {customFields.map((field, idx) => (
              <React.Fragment key={idx}>
                <Grid item xs={5} sm={4}><TextField label="Key" value={field.key} onChange={e => handleCustomFieldChange(idx, 'key', e.target.value)} fullWidth /></Grid>
                <Grid item xs={5} sm={6}><TextField label="Value" value={field.value} onChange={e => handleCustomFieldChange(idx, 'value', e.target.value)} fullWidth /></Grid>
                <Grid item xs={2} sm={2}>
                  <IconButton onClick={() => handleRemoveCustomField(idx)}><CloseIcon /></IconButton>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={5} sm={4}><TextField label="Key" value={newField.key} onChange={e => setNewField(f => ({ ...f, key: e.target.value }))} fullWidth /></Grid>
            <Grid item xs={5} sm={6}><TextField label="Value" value={newField.value} onChange={e => setNewField(f => ({ ...f, value: e.target.value }))} fullWidth /></Grid>
            <Grid item xs={2} sm={2}>
              <IconButton color="primary" onClick={handleAddCustomField}><AddCircleOutlineIcon /></IconButton>
            </Grid>
          </Grid>
        </Paper>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        {success && <Typography color="success.main" sx={{ mb: 2 }}>{success}</Typography>}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" color="primary">Submit</Button>
          {onCancel && <Button variant="outlined" color="secondary" onClick={onCancel}>Cancel</Button>}
        </Stack>
      </Box>
    </Paper>
  );
}
