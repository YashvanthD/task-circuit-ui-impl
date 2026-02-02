/**
 * PondMonitoringPage - Redesigned Pond Monitoring Dashboard
 */
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PondMonitoringDashboard, PondDetailView } from '../../components/pond';
import { QuickDailyLogForm } from '../../components/pond/forms/quick';
import { AddPondForm, UpdatePondForm } from '../../components/pond/forms';
import { useAlert, ViewHeader, StatusChip } from '../../components/common';
import { HealthStatusChip } from '../../components/common/enhanced';
import { fetchPonds, deletePond } from '../../services/pondService';
import { fetchFarms } from '../../services/farmService';
import { fetchMonitoringDashboardData, saveDailyLog } from '../../services/monitoringService';
import { useViewNavigation } from '../../hooks/useViewNavigation';

export default function PondMonitoringPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState([]); // Need to fetch farms
  const [stats, setStats] = useState({
    totalPonds: 0,
    activePonds: 0,
    needsAttention: 0,
    fedToday: 0
  });

  // Navigation State
  const {
    currentView: viewMode,
    selectedData: selectedPond,
    navigateTo,
    goBack,
    resetTo
  } = useViewNavigation('dashboard');

  const { showAlert } = useAlert();

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch aggregated dashboard data (Ponds enriched with Stock and Tasks)
      // 2. Fetch farms for filters/forms
      const [enrichedPonds, farmModels] = await Promise.all([
        fetchMonitoringDashboardData(),
        fetchFarms()
      ]);

      setFarms(farmModels);
      setPonds(enrichedPonds);

      // 3. Calculate summary stats from real data
      setStats({
        totalPonds: enrichedPonds.length,
        activePonds: enrichedPonds.filter(p => p.status !== 'empty').length,
        needsAttention: enrichedPonds.filter(p => p.health.status === 'attention' || p.health.status === 'critical').length,
        fedToday: enrichedPonds.filter(p => p.metadata?.last_feeding_date === new Date().toISOString().split('T')[0]).length
      });

    } catch (err) {
      console.error('Failed to load monitoring data:', err);
      showAlert('Failed to load pond data from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePondAction = (type, pond) => {
    console.log(`Action: ${type}`, pond);

    if (type === 'log_wq' || type === 'add_log' || type === 'feed') {
      navigateTo('log', pond);
    } else if (type === 'add_pond') {
      navigateTo('add');
    } else if (type === 'edit_pond') {
      navigateTo('edit', pond);
    } else if (type === 'view') {
      navigateTo('details', pond);
    }
  };

  const handleBack = () => {
    goBack();
  };

  const handleQuickLogSubmit = async (data) => {
    if (!selectedPond) return;

    setLoading(true);
    try {
      const result = await saveDailyLog(selectedPond.pond_id, data);

      if (result.success) {
        showAlert('Daily log saved successfully', 'success');
        goBack(); // Return to previous view
        loadData(); // Refresh all data
      } else {
        showAlert(result.error || 'Failed to save daily log', 'error');
      }
    } catch (err) {
      showAlert('An unexpected error occurred while saving', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePond = async (pondId) => {
    if (window.confirm('Are you sure you want to delete this pond?')) {
      try {
        const result = await deletePond(pondId);
        if (result.success) {
          showAlert('Pond deleted successfully', 'success');
          resetTo('dashboard'); // Go all the way back to dashboard after delete
          loadData();
        } else {
          showAlert(result.error || 'Failed to delete pond', 'error');
        }
      } catch (err) {
        showAlert('An unexpected error occurred', 'error');
      }
    }
  };

  const renderContent = () => {
    if (loading && ponds.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (viewMode !== 'dashboard') {
      return (
        <Box>
          <ViewHeader
            onBack={handleBack}
            title={
              viewMode === 'add' ? 'New Pond' :
              viewMode === 'edit' ? `Edit ${selectedPond?.name}` :
              viewMode === 'log' ? `Daily Log: ${selectedPond?.name}` :
              selectedPond?.name || 'Pond Details'
            }
            subtitle={
              viewMode === 'details' ? `${selectedPond?.pond_type} • ID: ${selectedPond?.pond_id}` : ''
            }
            action={
              viewMode === 'details' ? (
                <HealthStatusChip status={selectedPond?.health?.status} />
              ) : null
            }
          />

          {viewMode === 'add' && (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <AddPondForm
                onSuccess={() => {
                  goBack();
                  loadData();
                }}
                onCancel={handleBack}
              />
            </Box>
          )}

          {viewMode === 'edit' && selectedPond && (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <UpdatePondForm
                pondId={selectedPond.pond_id}
                initialData={selectedPond}
                onSuccess={() => {
                  goBack();
                  loadData();
                }}
                onCancel={handleBack}
                onDelete={() => handleDeletePond(selectedPond.pond_id)}
              />
            </Box>
          )}

          {viewMode === 'log' && (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <QuickDailyLogForm
                pond={selectedPond}
                onSubmit={handleQuickLogSubmit}
                onCancel={handleBack}
              />
            </Box>
          )}

          {viewMode === 'details' && (
            <PondDetailView
              pond={selectedPond}
              onBack={handleBack}
              onAction={handlePondAction}
            />
          )}
        </Box>
      );
    }

    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 1, sm: 0 } }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Pond Monitoring
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handlePondAction('add_pond')}
              size={isMobile ? 'small' : 'medium'}
            >
              Add Pond
            </Button>
            <Button
              variant="contained"
              onClick={() => loadData()}
              size={isMobile ? 'small' : 'medium'}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        <PondMonitoringDashboard
          ponds={ponds}
          stats={stats}
          farms={farms}
          loading={loading}
          onPondAction={handlePondAction}
        />
      </>
    );
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 1, sm: 3 }, // Reduced vertical padding on mobile
        px: { xs: 0, sm: 2 } // Removed horizontal padding on mobile to let FormContainer handle it
      }}
      disableGutters={true} // Further reduce outer spacing on small screens
    >
      {renderContent()}
    </Container>
  );
}
