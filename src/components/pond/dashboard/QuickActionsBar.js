/**
 * QuickActionsBar - Sticky bottom action bar for mobile
 */
import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Box, Fab, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WavesIcon from '@mui/icons-material/Waves';

export default function QuickActionsBar({
  onAction,
  activeTab = 0,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isMobile) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        pb: 'safe-area-inset-bottom'
      }}
      elevation={3}
    >
      <Box sx={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)' }}>
        <Fab color="primary" aria-label="add" onClick={() => onAction('add_log')}>
          <AddIcon />
        </Fab>
      </Box>
      <BottomNavigation
        showLabels
        value={activeTab}
        onChange={(event, newValue) => {
          onAction(newValue === 0 ? 'list' : newValue === 1 ? 'add_log' : 'stats');
        }}
      >
        <BottomNavigationAction label="Ponds" icon={<ListIcon />} />
        <BottomNavigationAction label="" icon={<Box sx={{ width: 24 }} />} disabled />
        <BottomNavigationAction label="Stats" icon={<AssessmentIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
