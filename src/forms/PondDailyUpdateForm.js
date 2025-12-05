import React, { useState } from 'react';
import { Paper, Typography, Button, TextField, Stack, Divider } from '@mui/material';

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
import React, { useState } from 'react';
import PondForm from '../forms/PondForm';
import { Card, CardContent, Typography, IconButton, Box, Divider, Stack, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const defaultPondData = {
  pond_id: '',
  farm_name: '',
  pond_number: '',
  pond_type: '',
  pond_area: '',
  pond_volume: '',
  pond_shape: '',
  pond_location: '',
  // Water Quality
  temperature: '',
  ph: '',
  dissolved_oxygen: '',
  salinity: '',
  turbidity: '',
  secchi_depth: '',
  tan: '',
  nitrite: '',
  nitrate: '',
  phosphate: '',
  alkalinity: '',
  hardness: '',
  co2: '',
  chlorine: '',
  water_renewal_rate: '',
  water_source: '',
  water_level: '',
  // Stocking
  stocking_date: '',
  stocked_species: '',
  number_stocked: '',
  avg_size_weight: '',
  fingerling_origin: '',
  stocking_density: '',
  // Feeding
  feed_type: '',
  feed_form: '',
  feed_amount: '',
  feeding_frequency: '',
  feeding_time: '',
  feeding_method: '',
  fcr: '',
  feed_protein: '',
  feed_cost: '',
  // Growth & Health
  sampling_date: '',
  number_sampled: '',
  avg_length: '',
  avg_weight: '',
  growth_rate: '',
  mortality: '',
  health_score: '',
  disease_signs: '',
  disease_type: '',
  parasite_inspection: '',
  // Maintenance
  silt_removal_date: '',
  weed_control: '',
  liming: '',
  fertilizer_application: '',
  water_exchange: '',
  aeration_method: '',
  pond_cleaning: '',
  harvesting_date: '',
  harvesting_method: '',
  mesh_condition: '',
  // Harvest
  harvest_date: '',
  harvest_method: '',
  number_harvested: '',
  weight_harvested: '',
  survival_rate: '',
  market_size: '',
  disease_at_harvest: '',
  sale_destination: '',
  // Inputs & Chemicals
  input_type: '',
  input_date: '',
  input_dosage: '',
  input_purpose: '',
  // Predators & Issues
  predator_incidence: '',
  pest_control: '',
  unusual_events: '',
  // Notes
  observations: '',
  incident_reports: '',
  photos: null,
  operator_name: '',
  record_date: '',
};

export default function Pond({ initialData = defaultPondData, onSubmit }) {
  const [editMode, setEditMode] = useState(false);
  const [pondData, setPondData] = useState(initialData);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);
  const handleSave = (data) => {
    setPondData(data);
    setEditMode(false);
    if (onSubmit) onSubmit(data);
  };

  if (editMode) {
    return (
      <Box>
        <PondForm onSubmit={handleSave} initialData={pondData} onCancel={handleCancel} />
      </Box>
    );
  }

  return (
    <Card sx={{ width: '100%', maxWidth: 'none', m: '40px auto', p: 2, boxShadow: 4, bgcolor: '#f8f9fa' }}>
      <CardContent sx={{ overflowY: 'auto', scrollBehavior: 'smooth', maxHeight: '80vh' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {pondData.farm_name ? `${pondData.farm_name} Pond` : 'Pond Data'}
            </Typography>
            {pondData.pond_id && (
              <Typography variant="caption" color="grey.600">ID: {pondData.pond_id}</Typography>
            )}
          </Box>
          <IconButton onClick={handleEdit} color="primary" sx={{ transition: '0.2s', '&:hover': { bgcolor: 'primary.light', boxShadow: 2 } }}>
            <EditIcon fontSize="large" />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Identification */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Identification</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pondData.farm_name && <Typography><strong>Farm Name:</strong> {pondData.farm_name}</Typography>}
          {pondData.pond_number && <Typography><strong>Pond Number:</strong> {pondData.pond_number}</Typography>}
          {pondData.pond_type && <Typography><strong>Pond Type:</strong> {pondData.pond_type}</Typography>}
          {pondData.pond_area && <Typography><strong>Pond Area:</strong> {pondData.pond_area}</Typography>}
          {pondData.pond_volume && <Typography><strong>Pond Volume:</strong> {pondData.pond_volume}</Typography>}
          {pondData.pond_shape && <Typography><strong>Pond Shape:</strong> {pondData.pond_shape}</Typography>}
          {pondData.pond_location && <Typography><strong>Location:</strong> {pondData.pond_location}</Typography>}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Water Quality */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Water Quality</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pondData.temperature && <Typography><strong>Temperature:</strong> {pondData.temperature}</Typography>}
          {pondData.ph && <Typography><strong>pH:</strong> {pondData.ph}</Typography>}
          {pondData.dissolved_oxygen && <Typography><strong>Dissolved Oxygen:</strong> {pondData.dissolved_oxygen}</Typography>}
          {pondData.salinity && <Typography><strong>Salinity:</strong> {pondData.salinity}</Typography>}
          {pondData.turbidity && <Typography><strong>Turbidity:</strong> {pondData.turbidity}</Typography>}
          {pondData.secchi_depth && <Typography><strong>Secchi Depth:</strong> {pondData.secchi_depth}</Typography>}
          {pondData.tan && <Typography><strong>TAN:</strong> {pondData.tan}</Typography>}
          {pondData.nitrite && <Typography><strong>Nitrite:</strong> {pondData.nitrite}</Typography>}
          {pondData.nitrate && <Typography><strong>Nitrate:</strong> {pondData.nitrate}</Typography>}
          {pondData.phosphate && <Typography><strong>Phosphate:</strong> {pondData.phosphate}</Typography>}
          {pondData.alkalinity && <Typography><strong>Alkalinity:</strong> {pondData.alkalinity}</Typography>}
          {pondData.hardness && <Typography><strong>Hardness:</strong> {pondData.hardness}</Typography>}
          {pondData.co2 && <Typography><strong>CO2:</strong> {pondData.co2}</Typography>}
          {pondData.chlorine && <Typography><strong>Chlorine:</strong> {pondData.chlorine}</Typography>}
          {pondData.water_renewal_rate && <Typography><strong>Water Renewal Rate:</strong> {pondData.water_renewal_rate}</Typography>}
          {pondData.water_source && <Typography><strong>Water Source:</strong> {pondData.water_source}</Typography>}
          {pondData.water_level && <Typography><strong>Water Level:</strong> {pondData.water_level}</Typography>}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Stocking */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Fish Stocking</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pondData.stocking_date && <Typography><strong>Stocking Date:</strong> {pondData.stocking_date}</Typography>}
          {pondData.stocked_species && <Typography><strong>Species:</strong> {pondData.stocked_species}</Typography>}
          {pondData.number_stocked && <Typography><strong>Number Stocked:</strong> {pondData.number_stocked}</Typography>}
          {pondData.avg_size_weight && <Typography><strong>Avg Size/Weight:</strong> {pondData.avg_size_weight}</Typography>}
          {pondData.fingerling_origin && <Typography><strong>Fingerling Origin:</strong> {pondData.fingerling_origin}</Typography>}
          {pondData.stocking_density && <Typography><strong>Stocking Density:</strong> {pondData.stocking_density}</Typography>}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Feeding */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Feeding Management</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pondData.feed_type && <Typography><strong>Feed Type:</strong> {pondData.feed_type}</Typography>}
          {pondData.feed_form && <Typography><strong>Feed Form:</strong> {pondData.feed_form}</Typography>}
          {pondData.feed_amount && <Typography><strong>Feed Amount:</strong> {pondData.feed_amount}</Typography>}
          {pondData.feeding_frequency && <Typography><strong>Feeding Frequency:</strong> {pondData.feeding_frequency}</Typography>}
          {pondData.feeding_time && <Typography><strong>Feeding Time:</strong> {pondData.feeding_time}</Typography>}
          {pondData.feeding_method && <Typography><strong>Feeding Method:</strong> {pondData.feeding_method}</Typography>}
          {pondData.fcr && <Typography><strong>FCR:</strong> {pondData.fcr}</Typography>}
          {pondData.feed_protein && <Typography><strong>Feed Protein %:</strong> {pondData.feed_protein}</Typography>}
          {pondData.feed_cost && <Typography><strong>Feed Cost:</strong> {pondData.feed_cost}</Typography>}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Growth & Health */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Growth & Health Monitoring</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pondData.sampling_date && <Typography><strong>Sampling Date:</strong> {pondData.sampling_date}</Typography>}
          {pondData.number_sampled && <Typography><strong>Number Sampled:</strong> {pondData.number_sampled}</Typography>}
          {pondData.avg_length && <Typography><strong>Avg Length:</strong> {pondData.avg_length}</Typography>}
          {pondData.avg_weight && <Typography><strong>Avg Weight:</strong> {pondData.avg_weight}</Typography>}
          {pondData.growth_rate && <Typography><strong>Growth Rate:</strong> {pondData.growth_rate}</Typography>}
          {pondData.mortality && <Typography><strong>Mortality:</strong> {pondData.mortality}</Typography>}
          {pondData.health_score && <Typography><strong>Health Score:</strong> {pondData.health_score}</Typography>}
          {pondData.disease_signs && <Typography><strong>Disease Signs:</strong> {pondData.disease_signs}</Typography>}
          {pondData.disease_type && <Typography><strong>Disease Type:</strong> {pondData.disease_type}</Typography>}
          {pondData.parasite_inspection && <Typography><strong>Parasite Inspection:</strong> {pondData.parasite_inspection}</Typography>}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Maintenance */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Pond Maintenance</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pondData.silt_removal_date && <Typography><strong>Silt Removal Date:</strong> {pondData.silt_removal_date}</Typography>}
          {pondData.weed_control && <Typography><strong>Weed Control:</strong> {pondData.weed_control}</Typography>}
          {pondData.liming && <Typography><strong>Liming:</strong> {pondData.liming}</Typography>}
          {pondData.fertilizer_application && <Typography><strong>Fertilizer Application:</strong> {pondData.fertilizer_application}</Typography>}
          {pondData.water_exchange && <Typography><strong>Water Exchange:</strong> {pondData.water_exchange}</Typography>}
          {pondData.aeration_method && <Typography><strong>Aeration Method:</strong> {pondData.aeration_method}</Typography>}
          {pondData.pond_cleaning && <Typography><strong>Pond Cleaning:</strong> {pondData.pond_cleaning}</Typography>}
          {pondData.harvesting_date && <Typography><strong>Harvesting Date:</strong> {pondData.harvesting_date}</Typography>}
          {pondData.harvesting_method && <Typography><strong>Harvesting Method:</strong> {pondData.harvesting_method}</Typography>}
          {pondData.mesh_condition && <Typography><strong>Mesh/Screen Condition:</strong> {pondData.mesh_condition}</Typography>}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Harvest */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Harvest Information</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pondData.harvest_date && <Typography><strong>Harvest Date:</strong> {pondData.harvest_date}</Typography>}
          {pondData.harvest_method && <Typography><strong>Harvest Method:</strong> {pondData.harvest_method}</Typography>}
          {pondData.number_harvested && <Typography><strong>Number Harvested:</strong> {pondData.number_harvested}</Typography>}
          {pondData.weight_harvested && <Typography><strong>Weight Harvested:</strong> {pondData.weight_harvested}</Typography>}
          {pondData.survival_rate && <Typography><strong>Survival Rate:</strong> {pondData.survival_rate}</Typography>}
          {pondData.market_size && <Typography><strong>Market Size:</strong> {pondData.market_size}</Typography>}
          {pondData.disease_at_harvest && <Typography><strong>Disease at Harvest:</strong> {pondData.disease_at_harvest}</Typography>}
          {pondData.sale_destination && <Typography><strong>Sale Destination:</strong> {pondData.sale_destination}</Typography>}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Inputs & Chemicals */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Input & Chemical Usage</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pondData.input_type && <Typography><strong>Type:</strong> {pondData.input_type}</Typography>}
          {pondData.input_date && <Typography><strong>Application Date:</strong> {pondData.input_date}</Typography>}
          {pondData.input_dosage && <Typography><strong>Dosage/Amount:</strong> {pondData.input_dosage}</Typography>}
          {pondData.input_purpose && <Typography><strong>Purpose:</strong> {pondData.input_purpose}</Typography>}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Predators & Issues */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Predators, Pests, and Other Issues</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pondData.predator_incidence && <Typography><strong>Predator Incidence:</strong> {pondData.predator_incidence}</Typography>}
          {pondData.pest_control && <Typography><strong>Pest Control:</strong> {pondData.pest_control}</Typography>}
          {pondData.unusual_events && <Typography><strong>Unusual Events:</strong> {pondData.unusual_events}</Typography>}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        {/* Notes & Observations */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Additional Notes & Observations</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pondData.observations && <Typography><strong>Observations:</strong> {pondData.observations}</Typography>}
          {pondData.incident_reports && <Typography><strong>Incident Reports:</strong> {pondData.incident_reports}</Typography>}
          {pondData.operator_name && <Typography><strong>Operator/Staff Name:</strong> {pondData.operator_name}</Typography>}
          {pondData.record_date && <Typography><strong>Record Date:</strong> {pondData.record_date}</Typography>}
        </Stack>
        {/* Photos */}
        {pondData.photos && (
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Paper elevation={2} sx={{ p: 1, bgcolor: '#fff', borderRadius: 2 }}>
              <img src={URL.createObjectURL(pondData.photos)} alt="Pond" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8 }} />
              <Typography variant="caption" display="block" align="center">Photo</Typography>
            </Paper>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

