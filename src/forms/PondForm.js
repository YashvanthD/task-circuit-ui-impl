import React, { useState } from 'react';
import { Paper, Typography, Button, TextField, Stack, MenuItem, Divider } from '@mui/material';

const pondTypes = ['Earthen', 'Lined', 'Concrete', 'Cage', 'Raceway'];
const pondShapes = ['Rectangular', 'Circular', 'Irregular'];
const waterSources = ['Well', 'River', 'Rainwater', 'Supply Line'];
const feedForms = ['Pellet', 'Crumble', 'Mash', 'Live'];
const feedingMethods = ['Broadcast', 'Tray', 'Automatic'];

export default function PondForm({ initialData = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialData);
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };
  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, margin: '40px auto' }}>
      <Typography variant="h5" gutterBottom>{form.farm_name ? `${form.farm_name} Pond` : 'Pond Data Entry'}</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Divider>Identification</Divider>
          <TextField label="Farm Name" name="farm_name" value={form.farm_name || ''} onChange={handleChange} fullWidth required />
          <TextField label="Pond Number" name="pond_number" value={form.pond_number || ''} onChange={handleChange} fullWidth />
          <TextField select label="Pond Type" name="pond_type" value={form.pond_type || ''} onChange={handleChange} fullWidth>
            {pondTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField label="Pond Area (m²)" name="pond_area" value={form.pond_area || ''} onChange={handleChange} fullWidth />
          <TextField label="Pond Volume (m³)" name="pond_volume" value={form.pond_volume || ''} onChange={handleChange} fullWidth />
          <TextField select label="Pond Shape" name="pond_shape" value={form.pond_shape || ''} onChange={handleChange} fullWidth>
            {pondShapes.map(shape => <MenuItem key={shape} value={shape}>{shape}</MenuItem>)}
          </TextField>
          <TextField label="Location/Coordinates" name="pond_location" value={form.pond_location || ''} onChange={handleChange} fullWidth />
          <Divider>Water Quality</Divider>
          <TextField label="Temperature (°C)" name="temperature" value={form.temperature || ''} onChange={handleChange} fullWidth />
          <TextField label="pH Level" name="ph" value={form.ph || ''} onChange={handleChange} fullWidth />
          <TextField label="Dissolved Oxygen (mg/L)" name="dissolved_oxygen" value={form.dissolved_oxygen || ''} onChange={handleChange} fullWidth />
          <TextField label="Salinity (ppt)" name="salinity" value={form.salinity || ''} onChange={handleChange} fullWidth />
          <TextField label="Turbidity (NTU)" name="turbidity" value={form.turbidity || ''} onChange={handleChange} fullWidth />
          <TextField label="Secchi Depth (cm)" name="secchi_depth" value={form.secchi_depth || ''} onChange={handleChange} fullWidth />
          <TextField label="Total Ammonia Nitrogen (mg/L)" name="tan" value={form.tan || ''} onChange={handleChange} fullWidth />
          <TextField label="Nitrite (mg/L)" name="nitrite" value={form.nitrite || ''} onChange={handleChange} fullWidth />
          <TextField label="Nitrate (mg/L)" name="nitrate" value={form.nitrate || ''} onChange={handleChange} fullWidth />
          <TextField label="Phosphate (mg/L)" name="phosphate" value={form.phosphate || ''} onChange={handleChange} fullWidth />
          <TextField label="Alkalinity (mg/L CaCO₃)" name="alkalinity" value={form.alkalinity || ''} onChange={handleChange} fullWidth />
          <TextField label="Hardness (mg/L)" name="hardness" value={form.hardness || ''} onChange={handleChange} fullWidth />
          <TextField label="Carbon Dioxide (mg/L)" name="co2" value={form.co2 || ''} onChange={handleChange} fullWidth />
          <TextField label="Chlorine (mg/L)" name="chlorine" value={form.chlorine || ''} onChange={handleChange} fullWidth />
          <TextField label="Water Renewal Rate" name="water_renewal_rate" value={form.water_renewal_rate || ''} onChange={handleChange} fullWidth />
          <TextField select label="Water Source" name="water_source" value={form.water_source || ''} onChange={handleChange} fullWidth>
            {waterSources.map(src => <MenuItem key={src} value={src}>{src}</MenuItem>)}
          </TextField>
          <TextField label="Water Level (cm/m)" name="water_level" value={form.water_level || ''} onChange={handleChange} fullWidth />
          <Divider>Fish Stocking</Divider>
          <TextField label="Stocking Date" name="stocking_date" value={form.stocking_date || ''} onChange={handleChange} fullWidth />
          <TextField label="Stocked Species" name="stocked_species" value={form.stocked_species || ''} onChange={handleChange} fullWidth />
          <TextField label="Number of Fish Stocked" name="number_stocked" value={form.number_stocked || ''} onChange={handleChange} fullWidth />
          <TextField label="Avg Size/Weight at Stocking" name="avg_size_weight" value={form.avg_size_weight || ''} onChange={handleChange} fullWidth />
          <TextField label="Origin of Fingerlings" name="fingerling_origin" value={form.fingerling_origin || ''} onChange={handleChange} fullWidth />
          <TextField label="Stocking Density" name="stocking_density" value={form.stocking_density || ''} onChange={handleChange} fullWidth />
          <Divider>Feeding Management</Divider>
          <TextField label="Feed Type/Brand" name="feed_type" value={form.feed_type || ''} onChange={handleChange} fullWidth />
          <TextField select label="Feed Form" name="feed_form" value={form.feed_form || ''} onChange={handleChange} fullWidth>
            {feedForms.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </TextField>
          <TextField label="Feed Amount per Day" name="feed_amount" value={form.feed_amount || ''} onChange={handleChange} fullWidth />
          <TextField label="Feeding Frequency" name="feeding_frequency" value={form.feeding_frequency || ''} onChange={handleChange} fullWidth />
          <TextField label="Feeding Time" name="feeding_time" value={form.feeding_time || ''} onChange={handleChange} fullWidth />
          <TextField select label="Feeding Method" name="feeding_method" value={form.feeding_method || ''} onChange={handleChange} fullWidth>
            {feedingMethods.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
          <TextField label="Feed Conversion Ratio (FCR)" name="fcr" value={form.fcr || ''} onChange={handleChange} fullWidth />
          <TextField label="Feed Protein %" name="feed_protein" value={form.feed_protein || ''} onChange={handleChange} fullWidth />
          <TextField label="Feed Cost" name="feed_cost" value={form.feed_cost || ''} onChange={handleChange} fullWidth />
          <Divider>Growth & Health Monitoring</Divider>
          <TextField label="Sampling Date" name="sampling_date" value={form.sampling_date || ''} onChange={handleChange} fullWidth />
          <TextField label="Number Sampled" name="number_sampled" value={form.number_sampled || ''} onChange={handleChange} fullWidth />
          <TextField label="Avg Length" name="avg_length" value={form.avg_length || ''} onChange={handleChange} fullWidth />
          <TextField label="Avg Weight" name="avg_weight" value={form.avg_weight || ''} onChange={handleChange} fullWidth />
          <TextField label="Growth Rate" name="growth_rate" value={form.growth_rate || ''} onChange={handleChange} fullWidth />
          <TextField label="Mortality" name="mortality" value={form.mortality || ''} onChange={handleChange} fullWidth />
          <TextField label="Health Condition/Score" name="health_score" value={form.health_score || ''} onChange={handleChange} fullWidth />
          <TextField label="Signs of Disease" name="disease_signs" value={form.disease_signs || ''} onChange={handleChange} fullWidth />
          <TextField label="Disease Type" name="disease_type" value={form.disease_type || ''} onChange={handleChange} fullWidth />
          <TextField label="Parasite Inspection" name="parasite_inspection" value={form.parasite_inspection || ''} onChange={handleChange} fullWidth />
          <Divider>Pond Maintenance</Divider>
          <TextField label="Silt Removal Date" name="silt_removal_date" value={form.silt_removal_date || ''} onChange={handleChange} fullWidth />
          <TextField label="Weed Control" name="weed_control" value={form.weed_control || ''} onChange={handleChange} fullWidth />
          <TextField label="Liming (date, amount)" name="liming" value={form.liming || ''} onChange={handleChange} fullWidth />
          <TextField label="Fertilizer Application" name="fertilizer_application" value={form.fertilizer_application || ''} onChange={handleChange} fullWidth />
          <TextField label="Water Exchange/Refill" name="water_exchange" value={form.water_exchange || ''} onChange={handleChange} fullWidth />
          <TextField label="Aeration Method & Hours" name="aeration_method" value={form.aeration_method || ''} onChange={handleChange} fullWidth />
          <TextField label="Pond Cleaning Events" name="pond_cleaning" value={form.pond_cleaning || ''} onChange={handleChange} fullWidth />
          <TextField label="Harvesting Date & Method" name="harvesting_date" value={form.harvesting_date || ''} onChange={handleChange} fullWidth />
          <TextField label="Mesh/Screen Condition" name="mesh_condition" value={form.mesh_condition || ''} onChange={handleChange} fullWidth />
          <Divider>Harvest Information</Divider>
          <TextField label="Harvest Date" name="harvest_date" value={form.harvest_date || ''} onChange={handleChange} fullWidth />
          <TextField label="Harvest Method" name="harvest_method" value={form.harvest_method || ''} onChange={handleChange} fullWidth />
          <TextField label="Number/Weight Harvested" name="number_harvested" value={form.number_harvested || ''} onChange={handleChange} fullWidth />
          <TextField label="Survival Rate" name="survival_rate" value={form.survival_rate || ''} onChange={handleChange} fullWidth />
          <TextField label="Average Market Size" name="market_size" value={form.market_size || ''} onChange={handleChange} fullWidth />
          <TextField label="Disease Observed at Harvest" name="disease_at_harvest" value={form.disease_at_harvest || ''} onChange={handleChange} fullWidth />
          <TextField label="Sale Destination/Buyer" name="sale_destination" value={form.sale_destination || ''} onChange={handleChange} fullWidth />
          <Divider>Input & Chemical Usage</Divider>
          <TextField label="Type of Inputs/Chemicals" name="input_type" value={form.input_type || ''} onChange={handleChange} fullWidth />
          <TextField label="Application Date" name="input_date" value={form.input_date || ''} onChange={handleChange} fullWidth />
          <TextField label="Dosage/Amount" name="input_dosage" value={form.input_dosage || ''} onChange={handleChange} fullWidth />
          <TextField label="Purpose" name="input_purpose" value={form.input_purpose || ''} onChange={handleChange} fullWidth />
          <Divider>Predators, Pests, and Other Issues</Divider>
          <TextField label="Predator Incidence" name="predator_incidence" value={form.predator_incidence || ''} onChange={handleChange} fullWidth />
          <TextField label="Pest Control Measures" name="pest_control" value={form.pest_control || ''} onChange={handleChange} fullWidth />
          <TextField label="Unusual Events" name="unusual_events" value={form.unusual_events || ''} onChange={handleChange} fullWidth />
          <Divider>Additional Notes & Observations</Divider>
          <TextField label="General Observations" name="observations" value={form.observations || ''} onChange={handleChange} fullWidth multiline rows={2} />
          <TextField label="Problem/Incident Reports" name="incident_reports" value={form.incident_reports || ''} onChange={handleChange} fullWidth multiline rows={2} />
          <TextField label="Operator/Staff Name" name="operator_name" value={form.operator_name || ''} onChange={handleChange} fullWidth />
          <TextField label="Record Date" name="record_date" value={form.record_date || ''} onChange={handleChange} fullWidth />
          <Button variant="contained" color="primary" type="submit">{form.farm_name ? 'Update Pond' : 'Add Pond'}</Button>
          <Button variant="outlined" color="secondary" onClick={onCancel}>Cancel</Button>
        </Stack>
      </form>
    </Paper>
  );
}

