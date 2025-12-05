import React, { useState } from 'react';
import FishForm from '../forms/FishForm';
import { Card, CardContent, Typography, IconButton, Box, Divider, Stack, Grid, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const defaultFishData = {
  capture_date: '',
  capture_time: '',
  vessel_name: '',
  gear_type: '',
  fishing_location: '',
  depth: '',
  water_temp: '',
  salinity: '',
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
  disposition: '',
  catch_type: '',
  processing_method: '',
  bycatch: '',
  specimen_photo: null,
  site_photo: null,
  observer_name: '',
  affiliation: '',
  form_number: '',
  sample_id: '',
};

export default function Fish({ initialData = defaultFishData, onSubmit }) {
  const [editMode, setEditMode] = useState(false);
  const [fishData, setFishData] = useState(initialData);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);
  const handleSave = (data) => {
    setFishData(data);
    setEditMode(false);
    if (onSubmit) onSubmit(data);
  };

  if (editMode) {
    return (
      <Box>
        <FishForm onSubmit={handleSave} initialData={fishData} onCancel={handleCancel} />
      </Box>
    );
  }

  return (
    <Card sx={{ width: '100%', maxWidth: 'none', m: '40px auto', p: 2, boxShadow: 4, bgcolor: '#f8f9fa' }}>
      <CardContent sx={{ overflowY: 'auto', scrollBehavior: 'smooth', maxHeight: '80vh' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {fishData.common_name ? `${fishData.common_name} Data` : 'Fish Data'}
            </Typography>
            {fishData.id && (
              <Typography variant="caption" color="grey.600">ID: {fishData.id}</Typography>
            )}
          </Box>
          <IconButton onClick={handleEdit} color="primary" sx={{ transition: '0.2s', '&:hover': { bgcolor: 'primary.light', boxShadow: 2 } }}>
            <EditIcon fontSize="large" />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Fishery / Catch Information */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Fishery / Catch Information</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {fishData.capture_date && <Typography><strong>Date:</strong> {fishData.capture_date}</Typography>}
          {fishData.capture_time && <Typography><strong>Time:</strong> {fishData.capture_time}</Typography>}
          {fishData.vessel_name && <Typography><strong>Vessel:</strong> {fishData.vessel_name}</Typography>}
          {fishData.gear_type && <Typography><strong>Gear:</strong> {fishData.gear_type}</Typography>}
          {fishData.fishing_location && <Typography><strong>Location:</strong> {fishData.fishing_location}</Typography>}
          {fishData.depth && <Typography><strong>Depth:</strong> {fishData.depth}</Typography>}
          {fishData.water_temp && <Typography><strong>Water Temp:</strong> {fishData.water_temp}</Typography>}
          {fishData.salinity && <Typography><strong>Salinity:</strong> {fishData.salinity}</Typography>}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Fish Biological Data */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Fish Biological Data</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {fishData.common_name && <Typography><strong>Common Name:</strong> {fishData.common_name}</Typography>}
          {fishData.scientific_name && <Typography><strong>Scientific Name:</strong> {fishData.scientific_name}</Typography>}
          {fishData.local_name && <Typography><strong>Local Name:</strong> {fishData.local_name}</Typography>}
          {fishData.species_code && <Typography><strong>Species Code:</strong> {fishData.species_code}</Typography>}
          {fishData.count && <Typography><strong>Count:</strong> {fishData.count}</Typography>}
          {fishData.total_length && <Typography><strong>Total Length:</strong> {fishData.total_length}</Typography>}
          {fishData.fork_length && <Typography><strong>Fork Length:</strong> {fishData.fork_length}</Typography>}
          {fishData.standard_length && <Typography><strong>Standard Length:</strong> {fishData.standard_length}</Typography>}
          {fishData.weight && <Typography><strong>Weight:</strong> {fishData.weight}</Typography>}
          {fishData.sex && <Typography><strong>Sex:</strong> {fishData.sex}</Typography>}
          {fishData.maturity_stage && <Typography><strong>Maturity Stage:</strong> {fishData.maturity_stage}</Typography>}
          {fishData.gonad_condition && <Typography><strong>Gonad Condition:</strong> {fishData.gonad_condition}</Typography>}
          {fishData.life_stage && <Typography><strong>Life Stage:</strong> {fishData.life_stage}</Typography>}
          {fishData.stomach_fullness && <Typography><strong>Stomach Fullness:</strong> {fishData.stomach_fullness}</Typography>}
          {fishData.abnormalities && <Typography><strong>Abnormalities:</strong> {fishData.abnormalities}</Typography>}
          {fishData.health_score && <Typography><strong>Health Score:</strong> {fishData.health_score}</Typography>}
        </Stack>
        {/* Custom Fields Section */}
        {Array.isArray(fishData.customFields) && fishData.customFields.length > 0 && (
          <>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Custom Fields</Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {fishData.customFields.filter(f => f.key && f.value).map((field, idx) => (
                <Typography key={idx}><strong>{field.key}:</strong> {field.value}</Typography>
              ))}
            </Stack>
          </>
        )}
        <Divider sx={{ mb: 3 }} />
        {/* Catch Use / Disposition */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Catch Use / Disposition</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {fishData.disposition && <Typography><strong>Disposition:</strong> {fishData.disposition}</Typography>}
          {fishData.catch_type && <Typography><strong>Catch Type:</strong> {fishData.catch_type}</Typography>}
          {fishData.processing_method && <Typography><strong>Processing Method:</strong> {fishData.processing_method}</Typography>}
          {fishData.bycatch && <Typography><strong>Bycatch/Target:</strong> {fishData.bycatch}</Typography>}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Photo / Other Attachments */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Photo / Other Attachments</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          {fishData.specimen_photo && (
            <Paper elevation={2} sx={{ p: 1, bgcolor: '#fff', borderRadius: 2 }}>
              <img src={URL.createObjectURL(fishData.specimen_photo)} alt="Specimen" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8 }} />
              <Typography variant="caption" display="block" align="center">Specimen</Typography>
            </Paper>
          )}
          {fishData.site_photo && (
            <Paper elevation={2} sx={{ p: 1, bgcolor: '#fff', borderRadius: 2 }}>
              <img src={URL.createObjectURL(fishData.site_photo)} alt="Site" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8 }} />
              <Typography variant="caption" display="block" align="center">Site</Typography>
            </Paper>
          )}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Reporting Information */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Reporting Information</Typography>
        <Stack spacing={1}>
          {fishData.observer_name && <Typography><strong>Observer:</strong> {fishData.observer_name}</Typography>}
          {fishData.affiliation && <Typography><strong>Affiliation:</strong> {fishData.affiliation}</Typography>}
          {fishData.form_number && <Typography><strong>Form Number:</strong> {fishData.form_number}</Typography>}
          {fishData.sample_id && <Typography><strong>Sample ID:</strong> {fishData.sample_id}</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
}
