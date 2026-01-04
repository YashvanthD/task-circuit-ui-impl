import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid, Button, TextField, Stack, CircularProgress, InputAdornment, Dialog, Box } from '@mui/material';
import Pond from '../../components/Pond';
import PondForm from '../../forms/PondForm';
import PondDailyUpdateForm from '../../forms/PondDailyUpdateForm';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import pondUtil, { pondEvents } from '../../utils/pond';
import { parsePondList, parsePond } from '../../utils/parsePond';


export default function PondPage() {
  const [selectedPond, setSelectedPond] = useState(null);
  const [editPondDialogOpen, setEditPondDialogOpen] = useState(false);
  const [pondDialogOpen, setPondDialogOpen] = useState(false);
  const [addPondDialogOpen, setAddPondDialogOpen] = useState(false);
  const [dailyUpdateDialogOpen, setDailyUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pondList, setPondList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPonds = async ({ force = false } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await pondUtil.getPonds({ force });
      console.debug('[PondPage] getPonds result:', res);
      // Use parsed result from pondUtil.getPonds()
      const mapped = (res && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
      console.debug('[PondPage] mapped ponds count:', Array.isArray(mapped) ? mapped.length : 0);
      // No raw fallback; use mapped (parsed) data or cached fallback below
      setPondList(mapped);
    } catch (err) {
      console.error('Failed to fetch ponds', err);
      setError(err.message || 'Failed to fetch ponds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Force an API fetch on mount to ensure fresh data (helps debugging). Remove force in production if undesired.
    fetchPonds({ force: true });
    // subscribe to pond events to keep UI in sync; parse payloads to normalized shape
    const unsubAdded = pondEvents.on('added', (p) => {
      const parsed = parsePond(p);
      setPondList(prev => [...prev, parsed]);
    });
    const unsubUpdated = pondEvents.on('updated', (p) => {
      const parsed = parsePond(p);
      setPondList(prev => prev.map(x => (x.pond_id === parsed.pond_id || x.id === parsed.id ? { ...x, ...parsed } : x)));
    });
    const unsubDeleted = pondEvents.on('deleted', ({ pondId, id }) => setPondList(prev => prev.filter(x => !(x.pond_id === pondId || x.id === pondId || x.id === id))));
    const unsubRefreshed = pondEvents.on('refreshed', (list) => setPondList(parsePondList(list || [])));
    const unsubDaily = pondEvents.on('dailyUpdate', ({ pondId, update }) => {
      const upd = { last_update: update.date || new Date().toISOString(), ...update };
      setPondList(prev => prev.map(x => (x.pond_id === pondId || x.id === pondId ? { ...x, ...upd } : x)));
    });
    return () => {
      unsubAdded(); unsubUpdated(); unsubDeleted(); unsubRefreshed(); unsubDaily();
    };
  }, []);

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
  const handleAddPond = async (newPond) => {
    try {
      await pondUtil.createPond(newPond);
      // pondEvents will update the list; close dialog
      setAddPondDialogOpen(false);
    } catch (err) {
      console.error('Failed to add pond', err);
      alert('Failed to add pond: ' + (err.message || err));
    }
  };
  const handleEditPond = (pond) => {
    setSelectedPond(pond);
    setEditPondDialogOpen(true);
  };
  const handleCloseEditPond = () => { setEditPondDialogOpen(false); setSelectedPond(null); };
  const submitEditPond = async (updated) => {
    try {
      const id = updated.pond_id || updated.id || selectedPond?.pond_id || selectedPond?.id;
      if (!id) { alert('Missing pond id'); return; }
      await pondUtil.modifyPond(id, updated);
      setEditPondDialogOpen(false);
    } catch (err) {
      console.error('Failed to update pond', err);
      alert('Failed to update pond: ' + (err.message || err));
    }
  };

  const handleOpenDailyUpdate = (pond) => {
    setSelectedPond(pond);
    setDailyUpdateDialogOpen(true);
  };
  const handleCloseDailyUpdate = () => {
    setDailyUpdateDialogOpen(false);
    setSelectedPond(null);
  };
  const handleDailyUpdate = async (update) => {
    try {
      const pid = selectedPond?.pond_id || update.pond_id;
      if (!pid) {
        alert('Missing pond id');
        return;
      }
      await pondUtil.addDailyUpdate(pid, update);
      // pondEvents will refresh list; close dialog
      setDailyUpdateDialogOpen(false);
    } catch (err) {
      console.error('Failed to submit daily update', err);
      alert('Failed to submit daily update: ' + (err.message || err));
    }
  };

  const handleDeletePond = (pond) => {
    setDeleteCandidate(pond);
    setDeleteDialogOpen(true);
  };
  const confirmDeletePond = async () => {
    const pond = deleteCandidate;
    if (!pond) { setDeleteDialogOpen(false); return; }
    try {
      const id = pond.pond_id || pond.id;
      await pondUtil.removePond(id);
    } catch (err) {
      console.error('Failed to delete pond', err);
      alert('Failed to delete pond: ' + (err.message || err));
    } finally {
      setDeleteDialogOpen(false);
      setDeleteCandidate(null);
    }
  };
  const cancelDeletePond = () => { setDeleteDialogOpen(false); setDeleteCandidate(null); };

  const filteredPondList = pondList.filter(pond =>
    (pond.farm_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pond.pond_location || '').toLowerCase().includes(searchTerm.toLowerCase())
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
          InputProps={{ startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ mr: 1, color: 'grey.500' }} />
            </InputAdornment>
          ) }}
        />
        <Button variant="contained" color="primary" onClick={handleOpenAddPond} startIcon={<AddCircleIcon />}>Add Pond</Button>
      </Stack>

      {loading ? <CircularProgress /> : null}
      {error && <Typography color="error">{error}</Typography>}

      {filteredPondList.length === 0 && !loading ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>No ponds available.</Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredPondList.map(pond => (
            <Grid item xs={12} sm={6} md={4} key={pond.pond_id || pond.id}>
              <Pond initialData={pond} onOpen={handleOpenPond} onDailyUpdate={(p) => handleOpenDailyUpdate(p)} onEdit={handleEditPond} onDelete={handleDeletePond} />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={pondDialogOpen} onClose={handleClosePond} maxWidth="lg" fullWidth>
        {selectedPond && <Pond initialData={selectedPond} />}
      </Dialog>
      <Dialog open={addPondDialogOpen} onClose={handleCloseAddPond} maxWidth="lg" fullWidth>
        <PondForm onSubmit={handleAddPond} onCancel={handleCloseAddPond} />
      </Dialog>
      <Dialog open={editPondDialogOpen} onClose={handleCloseEditPond} maxWidth="lg" fullWidth>
        <PondForm initialData={selectedPond} onSubmit={submitEditPond} onCancel={handleCloseEditPond} />
      </Dialog>
      <Dialog open={dailyUpdateDialogOpen} onClose={handleCloseDailyUpdate} maxWidth="sm" fullWidth>
        <PondDailyUpdateForm initialData={{ pond_id: selectedPond?.pond_id || '', date: new Date().toISOString().slice(0,10) }} onSubmit={handleDailyUpdate} onCancel={handleCloseDailyUpdate} />
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={cancelDeletePond} maxWidth="xs" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Confirm delete</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Are you sure you want to delete pond <strong>{deleteCandidate?.pond_id || deleteCandidate?.id}</strong>? This action cannot be undone.</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={cancelDeletePond}>Cancel</Button>
            <Button variant="contained" color="error" onClick={confirmDeletePond}>Delete</Button>
          </Stack>
        </Box>
      </Dialog>
    </Paper>
  );
}
