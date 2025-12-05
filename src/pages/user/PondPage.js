import React, { useState } from 'react';
import { Paper, Typography, Grid, Card, CardContent, CardActionArea, Dialog, Button, TextField, Stack } from '@mui/material';
import Pond from '../../components/Pond';
import PondForm from '../../forms/PondForm';
import PondDailyUpdateForm from '../../forms/PondDailyUpdateForm';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PoolIcon from '@mui/icons-material/Pool';

const mockPondList = [
  {
    pond_id: 1,
    farm_name: 'AquaFarm',
    pond_number: 'P1',
    pond_type: 'Earthen',
    pond_area: '500',
    pond_volume: '1000',
    pond_shape: 'Rectangular',
    pond_location: '12.34, 56.78',
    temperature: '28',
    ph: '7.5',
    dissolved_oxygen: '6.2',
    stocked_species: 'Tilapia',
    number_stocked: '1000',
    last_update: '2025-12-05',
  },
  {
    pond_id: 2,
    farm_name: 'BlueWater',
    pond_number: 'P2',
    pond_type: 'Concrete',
    pond_area: '300',
    pond_volume: '600',
    pond_shape: 'Circular',
    pond_location: '23.45, 67.89',
    temperature: '26',
    ph: '7.2',
    dissolved_oxygen: '5.8',
    stocked_species: 'Catfish',
    number_stocked: '500',
    last_update: '2025-12-04',
  },
];

export default function PondPage() {
  const [selectedPond, setSelectedPond] = useState(null);
  const [pondDialogOpen, setPondDialogOpen] = useState(false);
  const [addPondDialogOpen, setAddPondDialogOpen] = useState(false);
  const [dailyUpdateDialogOpen, setDailyUpdateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pondList, setPondList] = useState(mockPondList);

  const handleOpenPond = (pond) => {
    setSelectedPond(pond);
    setPondDialogOpen(true);
  };
  const handleClosePond = () => {
    setPondDialogOpen(false);
    setSelectedPond(null);
  };
  const handleOpenAddPond = () => {
    setAddPondDialogOpen(true);
  };
  const handleCloseAddPond = () => {
    setAddPondDialogOpen(false);
  };
  const handleAddPond = (newPond) => {
    setPondList(prev => [...prev, { ...newPond, pond_id: Date.now() }]);
    setAddPondDialogOpen(false);
  };
  const handleOpenDailyUpdate = (pond) => {
    setSelectedPond(pond);
    setDailyUpdateDialogOpen(true);
  };
  const handleCloseDailyUpdate = () => {
    setDailyUpdateDialogOpen(false);
    setSelectedPond(null);
  };
  const handleDailyUpdate = (update) => {
    // For demo, just close dialog. In real app, update pond's last_update and water/feed/mortality.
    setDailyUpdateDialogOpen(false);
  };
  const filteredPondList = pondList.filter(pond =>
    pond.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pond.pond_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper sx={{ padding: 4, maxWidth: 1000, margin: '40px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Pond Management
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        View, edit, and add pond records. Daily updates supported.
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} justifyContent="space-between" alignItems="center">
        <TextField
          label="Search by Name/Location"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ minWidth: 220 }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'grey.500' }} /> }}
        />
        <Button variant="contained" color="primary" onClick={handleOpenAddPond} startIcon={<AddCircleIcon />}>Add Pond</Button>
      </Stack>
      <Grid container spacing={2}>
        {filteredPondList.map(pond => (
          <Grid item xs={12} sm={6} md={4} key={pond.pond_id}>
            <Card variant="outlined" sx={{ mb: 1, p: 2, minHeight: 120 }}>
              <CardActionArea onClick={() => handleOpenPond(pond)} sx={{ display: 'flex', alignItems: 'center' }}>
                <PoolIcon sx={{ fontSize: 48, color: 'grey.400', mr: 2 }} />
                <CardContent sx={{ p: 0, flex: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={600}>{pond.farm_name}</Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>ID: {pond.pond_id}</Typography>
                  </Stack>
                  <Typography variant="body2" color="grey.500" sx={{ fontSize: '0.95em', mb: 0.5 }}>{pond.pond_type} | {pond.pond_shape}</Typography>
                  <Typography variant="caption" color="info.main" sx={{ display: 'block', mb: 0.5 }}>
                    Area: {pond.pond_area} m² | Volume: {pond.pond_volume} m³
                  </Typography>
                  <Typography variant="caption" color="secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Location: {pond.pond_location}
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 0.5 }}>
                    Water: {pond.temperature}°C, pH {pond.ph}, DO {pond.dissolved_oxygen} mg/L
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Stocked: {pond.stocked_species} ({pond.number_stocked})
                  </Typography>
                  <Typography variant="caption" color="grey.600" sx={{ display: 'block', mb: 0.5 }}>
                    Last Update: {pond.last_update}
                  </Typography>
                  <Button variant="outlined" color="info" size="small" sx={{ mt: 1 }} onClick={e => { e.stopPropagation(); handleOpenDailyUpdate(pond); }}>Daily Update</Button>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={pondDialogOpen} onClose={handleClosePond} maxWidth="lg" fullWidth>
        {selectedPond && <Pond initialData={selectedPond} />}
      </Dialog>
      <Dialog open={addPondDialogOpen} onClose={handleCloseAddPond} maxWidth="lg" fullWidth>
        <PondForm onSubmit={handleAddPond} onCancel={handleCloseAddPond} />
      </Dialog>
      <Dialog open={dailyUpdateDialogOpen} onClose={handleCloseDailyUpdate} maxWidth="sm" fullWidth>
        <PondDailyUpdateForm initialData={{ pond_id: selectedPond?.pond_id || '', date: new Date().toISOString().slice(0,10) }} onSubmit={handleDailyUpdate} onCancel={handleCloseDailyUpdate} />
      </Dialog>
    </Paper>
  );
}

