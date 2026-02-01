import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid, Button, TextField, Stack, CircularProgress, InputAdornment, Dialog, Box, useMediaQuery, useTheme, Chip } from '@mui/material';
import PondCard from '../../components/PondCard';
import { AddPondForm, UpdatePondForm, PondDailyUpdateForm } from '../../components/pond/forms';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import pondUtil, { pondEvents } from '../../utils/pond';
import { parsePondList, parsePond } from '../../utils/parsePond';
import { ConfirmDialog } from '../../components';


export default function PondPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  const handleEditPond = (pond) => {
    setSelectedPond(pond);
    setEditPondDialogOpen(true);
  };
  const handleCloseEditPond = () => {
    setEditPondDialogOpen(false);
    setSelectedPond(null);
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
    (pond.pond_location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pond.pond_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalPonds = pondList.length;
  const totalFish = pondList.reduce((acc, p) => {
    const stock = p.currentStock || p.current_stock || [];
    return acc + (Array.isArray(stock) ? stock.reduce((a, s) => a + Number(s.count || 0), 0) : 0);
  }, 0);
  const totalValue = pondList.reduce((acc, p) => acc + Number(p.current_stock_value || p.stock_value || 0), 0);

  return (
    <Paper sx={{ padding: { xs: 2, sm: 3, md: 4 }, maxWidth: 1280, margin: { xs: '16px auto', sm: '24px auto', md: '40px auto' } }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Pond Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View, edit, and manage your pond records
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddPond}
          startIcon={<AddCircleIcon />}
          sx={{ borderRadius: 2, alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Add Pond
        </Button>
      </Stack>

      {/* Stats Bar - Scrollable on mobile */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 3,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
        }}
      >
        <Chip label={`🏊 ${totalPonds} Ponds`} color="primary" size="small" sx={{ flexShrink: 0 }} />
        <Chip label={`🐟 ${totalFish.toLocaleString()} Fish`} color="info" size="small" sx={{ flexShrink: 0 }} />
        <Chip label={`₹${totalValue.toLocaleString()} Value`} color="success" size="small" sx={{ flexShrink: 0 }} />
      </Box>

      {/* Search and Refresh - Stack on mobile */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <TextField
          label="Search by Name, Location or ID"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ flex: { xs: 'auto', sm: 1 }, maxWidth: { sm: 400 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'grey.500' }} />
              </InputAdornment>
            )
          }}
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={() => fetchPonds({ force: true })}
          disabled={loading}
          sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}
        >
          Refresh
        </Button>
      </Stack>

      {/* Loading */}
      {loading && (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>Loading ponds...</Typography>
        </Stack>
      )}

      {/* Error */}
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', border: '1px solid', borderColor: 'error.main' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography color="error">{error}</Typography>
            <Button size="small" onClick={() => fetchPonds({ force: true })}>Retry</Button>
          </Stack>
        </Paper>
      )}

      {/* Empty State */}
      {filteredPondList.length === 0 && !loading && !error && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="body1" color="text.secondary">No ponds found.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Click "Add Pond" to create your first pond!
          </Typography>
        </Paper>
      )}

      {/* Ponds Grid - Larger cards since ponds are fewer */}
      {!loading && !error && filteredPondList.length > 0 && (
        <Grid container spacing={isMobile ? 2 : 3}>
          {filteredPondList.map(pond => (
            <Grid item xs={12} md={6} lg={6} key={pond.pond_id || pond.id}>
              <PondCard
                pond={pond}
                onOpen={handleOpenPond}
                onEdit={handleEditPond}
                onDelete={handleDeletePond}
                onDailyUpdate={handleOpenDailyUpdate}
                compact={isMobile}
                expanded={!isMobile}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* View Pond Dialog */}
      <Dialog open={pondDialogOpen} onClose={handleClosePond} maxWidth="md" fullWidth>
        {selectedPond && (
          <Box sx={{ p: 3 }}>
            <PondCard pond={selectedPond} onEdit={handleEditPond} onDailyUpdate={handleOpenDailyUpdate} />
          </Box>
        )}
      </Dialog>

      {/* Add Pond Dialog */}
      <Dialog open={addPondDialogOpen} onClose={handleCloseAddPond} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Add New Pond</Typography>
          <AddPondForm
            onSuccess={(pond) => {
              console.log('Pond created:', pond);
              handleCloseAddPond();
              fetchPonds({ force: true });
            }}
            onCancel={handleCloseAddPond}
          />
        </Box>
      </Dialog>

      {/* Edit Pond Dialog */}
      <Dialog open={editPondDialogOpen} onClose={handleCloseEditPond} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Edit Pond</Typography>
          <UpdatePondForm
            pondId={selectedPond?.pond_id || selectedPond?.id}
            initialData={selectedPond}
            onSuccess={(pond) => {
              console.log('Pond updated:', pond);
              handleCloseEditPond();
              fetchPonds({ force: true });
            }}
            onCancel={handleCloseEditPond}
          />
        </Box>
      </Dialog>

      {/* Daily Update Dialog */}
      <Dialog open={dailyUpdateDialogOpen} onClose={handleCloseDailyUpdate} maxWidth="sm" fullWidth>
        <PondDailyUpdateForm
          initialData={{ pond_id: selectedPond?.pond_id || '', date: new Date().toISOString().slice(0,10) }}
          onSubmit={handleDailyUpdate}
          onCancel={handleCloseDailyUpdate}
        />
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Pond"
        message={`Are you sure you want to delete pond "${deleteCandidate?.farm_name || deleteCandidate?.pond_id}"? This action cannot be undone.`}
        onConfirm={confirmDeletePond}
        onCancel={cancelDeletePond}
        confirmText="Delete"
        confirmColor="error"
      />
    </Paper>
  );
}
