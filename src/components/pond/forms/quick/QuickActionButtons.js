/**
 * QuickActionButtons - One-tap action buttons for quick logs
 */
import React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SetMealIcon from '@mui/icons-material/SetMeal';
import WavesIcon from '@mui/icons-material/Waves';
import ThermostatIcon from '@mui/icons-material/Thermostat';

export default function QuickActionButtons({
  onQuickAction,
  availableActions = ['visual_ok', 'fed_normal', 'water_ok', 'temp_ok'],
}) {
  const actions = {
    visual_ok: { label: 'Visual Check OK', icon: <CheckCircleIcon />, color: 'success' },
    fed_normal: { label: 'Fed Normal', icon: <SetMealIcon />, color: 'primary' },
    water_ok: { label: 'Water OK', icon: <WavesIcon />, color: 'info' },
    temp_ok: { label: 'Temp Normal', icon: <ThermostatIcon />, color: 'warning' },
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase' }}>
        One-Tap Quick Actions
      </Typography>
      <Grid container spacing={1}>
        {availableActions.map(actionKey => (
          <Grid item xs={6} sm={3} key={actionKey}>
            <Button
              variant="outlined"
              fullWidth
              color={actions[actionKey]?.color || 'primary'}
              startIcon={actions[actionKey]?.icon}
              onClick={() => onQuickAction(actionKey)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                height: '100%',
                py: { xs: 1, sm: 1.5 },
                px: { xs: 1, sm: 2 },
                '& .MuiButton-startIcon': {
                  mr: { xs: 0.5, sm: 1 }
                }
              }}
            >
              <Typography variant="body2" sx={{
                lineHeight: 1.2,
                fontSize: { xs: '0.7rem', sm: '0.875rem' }
              }}>
                {actions[actionKey]?.label}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
