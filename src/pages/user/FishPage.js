import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid, Card, CardContent, CardActionArea, Dialog, Button, TextField, Stack, CircularProgress } from '@mui/material';
import Fish from '../../components/Fish';
import FishForm from '../../forms/FishForm';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PoolIcon from '@mui/icons-material/Pool';
import fishUtil, { fishEvents } from '../../utils/fish';
import { parseFishList } from '../../utils/parseFish';
import SamplingForm from '../../forms/SamplingForm';

export default function FishPage() {
  const [selectedFish, setSelectedFish] = useState(null);
  const [fishDialogOpen, setFishDialogOpen] = useState(false);
  const [addFishDialogOpen, setAddFishDialogOpen] = useState(false);
  const [samplingDialogOpen, setSamplingDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fishList, setFishList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFish = async ({ force = false } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fishUtil.getFishList({ force });
      const raw = res && (res.data || res) ? (res.data || res) : [];
      const mapped = parseFishList(raw);
      if ((!Array.isArray(mapped) || mapped.length === 0) && fishUtil.getCachedFish) {
        const cached = fishUtil.getCachedFish();
        if (Array.isArray(cached) && cached.length > 0) {
          setFishList(cached);
          setLoading(false);
          return;
        }
      }
      setFishList(mapped);
    } catch (err) {
      console.error('Failed to fetch fish', err);
      setError(err.message || 'Failed to fetch fish');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFish({ force: true });
    // subscribe to fish events to keep UI in sync
    const unsubAdded = fishEvents.on('added', (p) => {
      const parsed = p && p.id ? p : (p && p.data ? p.data : p);
      setFishList(prev => [...prev, parsed]);
    });
    const unsubUpdated = fishEvents.on('updated', (p) => {
      const parsed = p && p.id ? p : (p && p.data ? p.data : p);
      setFishList(prev => prev.map(x => (x.id === parsed.id || x.fish_id === parsed.fish_id ? { ...x, ...parsed } : x)));
    });
    const unsubDeleted = fishEvents.on('deleted', ({ id }) => setFishList(prev => prev.filter(x => !(x.id === id || x.fish_id === id))));
    const unsubRefreshed = fishEvents.on('refreshed', (list) => setFishList(parseFishList(list || [])));
    return () => { unsubAdded(); unsubUpdated(); unsubDeleted(); unsubRefreshed(); };
  }, []);

  const handleOpenFish = (fish) => { setSelectedFish(fish); setFishDialogOpen(true); };
  const handleCloseFish = () => { setFishDialogOpen(false); setSelectedFish(null); };
  const handleOpenAddFish = () => setAddFishDialogOpen(true);
  const handleCloseAddFish = () => setAddFishDialogOpen(false);
  const handleOpenSampling = () => setSamplingDialogOpen(true);
  const handleCloseSampling = () => setSamplingDialogOpen(false);
  const handleAddFish = async (newFish) => {
    try {
      await fishUtil.createFish(newFish);
      setAddFishDialogOpen(false);
    } catch (err) {
      console.error('Failed to add fish', err);
      alert('Failed to add fish: ' + (err.message || err));
    }
  };
  const handleSubmitSampling = (data) => {
    console.log('Sampling submitted from FishPage', data);
    setSamplingDialogOpen(false);
  };

  const filteredFishList = fishList.filter(fish => (fish.common_name || '').toLowerCase().includes(searchTerm.toLowerCase()));

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
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="secondary" onClick={handleOpenSampling}>Sampling</Button>
          <Button variant="contained" color="primary" onClick={handleOpenAddFish} startIcon={<AddCircleIcon />}>Add Fish Data</Button>
        </Stack>
      </Stack>

      {loading ? <CircularProgress /> : null}
      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={2}>
        {filteredFishList.map(fish => (
          <Grid item xs={12} sm={6} md={4} key={fish.id || fish.fish_id}>
            <Card variant="outlined" sx={{ mb: 1, p: 2, minHeight: 120 }}>
              <CardActionArea onClick={() => handleOpenFish(fish)} sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Fish image if available */}
                {fish.specimen_photo ? (
                  <img src={fish.specimen_photo} alt={fish.common_name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, marginRight: 16 }} />
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
                      Next Date: {(() => { const d = new Date(fish.capture_date); d.setDate(d.getDate() + 30); return d.toLocaleDateString(); })()}
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
      <Dialog open={samplingDialogOpen} onClose={handleCloseSampling} maxWidth="sm" fullWidth>
        <SamplingForm onSubmit={handleSubmitSampling} onCancel={handleCloseSampling} />
      </Dialog>
    </Paper>
  );
}
