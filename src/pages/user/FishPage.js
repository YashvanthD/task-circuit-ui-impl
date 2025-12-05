import React, { useState } from 'react';
import { Paper, Typography, Grid, Card, CardContent, CardActionArea, Dialog, Button, TextField, Stack } from '@mui/material';
import Fish from '../../components/Fish';
import FishForm from '../../forms/FishForm';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PoolIcon from '@mui/icons-material/Pool';

const mockFishList = [
  {
    id: 1,
    common_name: 'Tilapia',
    scientific_name: 'Oreochromis niloticus',
    capture_date: '2025-12-01',
    vessel_name: 'AquaVessel',
    specimen_photo: null,
    count: 10,
    ponds: ['Pond 1', 'Pond 2'],
  },
  {
    id: 2,
    common_name: 'Catfish',
    scientific_name: 'Clarias gariepinus',
    capture_date: '2025-11-28',
    vessel_name: 'FishBoat',
    specimen_photo: null,
    count: 5,
    ponds: ['Pond 3'],
  },
];

export default function FishPage() {
  const [selectedFish, setSelectedFish] = useState(null);
  const [fishDialogOpen, setFishDialogOpen] = useState(false);
  const [addFishDialogOpen, setAddFishDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fishList, setFishList] = useState(mockFishList);

  const handleOpenFish = (fish) => {
    setSelectedFish(fish);
    setFishDialogOpen(true);
  };
  const handleCloseFish = () => {
    setFishDialogOpen(false);
    setSelectedFish(null);
  };
  const handleOpenAddFish = () => {
    setAddFishDialogOpen(true);
  };
  const handleCloseAddFish = () => {
    setAddFishDialogOpen(false);
  };
  const handleAddFish = (newFish) => {
    setFishList(prev => [...prev, { ...newFish, id: Date.now() }]);
    setAddFishDialogOpen(false);
  };
  const filteredFishList = fishList.filter(fish =>
    fish.common_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper sx={{ padding: 4, maxWidth: 1000, margin: '40px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Fish Data Management
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        View, edit, and add fish records.
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} justifyContent="space-between" alignItems="center">
        <TextField
          label="Search by Name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ minWidth: 220 }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'grey.500' }} /> }}
        />
        <Button variant="contained" color="primary" onClick={handleOpenAddFish} startIcon={<AddCircleIcon />}>Add Fish Data</Button>
      </Stack>
      <Grid container spacing={2}>
        {filteredFishList.map(fish => (
          <Grid item xs={12} sm={6} md={4} key={fish.id}>
            <Card variant="outlined" sx={{ mb: 1, p: 2, minHeight: 120 }}>
              <CardActionArea onClick={() => handleOpenFish(fish)} sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Fish image if available */}
                {fish.specimen_photo ? (
                  <img src={URL.createObjectURL(fish.specimen_photo)} alt={fish.common_name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, marginRight: 16 }} />
                ) : (
                  <PoolIcon sx={{ fontSize: 48, color: 'grey.400', mr: 2 }} />
                )}
                <CardContent sx={{ p: 0, flex: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={600}>{fish.common_name}</Typography>
                    {/* Total count */}
                    {fish.count && <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>Count: {fish.count}</Typography>}
                  </Stack>
                  {/* Fish ID */}
                  {fish.id && (
                    <Typography variant="caption" color="grey.600" sx={{ mb: 0.5 }}>ID: {fish.id}</Typography>
                  )}
                  <Typography variant="body2" color="grey.500" sx={{ fontSize: '0.95em', mb: 0.5 }}>{fish.scientific_name}</Typography>
                  {/* Next date */}
                  {fish.capture_date && (
                    <Typography variant="caption" color="info.main" sx={{ display: 'block', mb: 0.5 }}>
                      Next Date: {(() => {
                        const d = new Date(fish.capture_date);
                        d.setDate(d.getDate() + 30);
                        return d.toLocaleDateString();
                      })()}
                    </Typography>
                  )}
                  {/* Ponds list */}
                  {Array.isArray(fish.ponds) && fish.ponds.length > 0 && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="secondary" sx={{ fontWeight: 500 }}>Ponds:</Typography>
                      {fish.ponds.map((pond, idx) => (
                        <Typography key={idx} variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>{pond}</Typography>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={fishDialogOpen} onClose={handleCloseFish} maxWidth="lg" fullWidth>
        {selectedFish && <Fish initialData={selectedFish} />}
      </Dialog>
      <Dialog open={addFishDialogOpen} onClose={handleCloseAddFish} maxWidth="lg" fullWidth>
        <FishForm onSubmit={handleAddFish} onCancel={handleCloseAddFish} />
      </Dialog>
    </Paper>
  );
}
