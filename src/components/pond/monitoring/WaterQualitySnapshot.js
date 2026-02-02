/**
 * WaterQualitySnapshot - Compact WQ display for cards
 */
import React from 'react';
import { Box, Typography,  Grid } from '@mui/material';
import { ParameterIndicator } from '../../common/enhanced';
import { formatDistanceToNow } from 'date-fns';

export default function WaterQualitySnapshot({
  waterQuality,
  showTimestamp = true,
  parameters = ['temperature', 'ph', 'dissolved_oxygen'],
  compact = false,
  onClick,
}) {
  if (!waterQuality) {
    return (
      <Box sx={{ py: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">No water quality data</Typography>
      </Box>
    );
  }

  const lastChecked = waterQuality.created_at || waterQuality.timestamp;
  const timeAgo = lastChecked ? formatDistanceToNow(new Date(lastChecked), { addSuffix: true }) : 'Unknown';

  const getParamStatus = (param, value) => {
      // Todo: Use centralized validation logic from models
      if (param === 'dissolved_oxygen' && value < 4) return 'critical';
      if (param === 'ph' && (value < 6.5 || value > 8.5)) return 'critical';
      return 'optimal';
  };

  const getUnit = (param) => {
      if (param === 'temperature') return '°C';
      if (param === 'dissolved_oxygen') return 'mg/L';
      return '';
  };

  const getLabel = (param) => {
      if (param === 'temperature') return 'Temp';
      if (param === 'dissolved_oxygen') return 'DO';
      return 'pH';
  };

  return (
    <Box sx={{ width: '100%', mt: 1 }} onClick={onClick}>
      {showTimestamp && (
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
          Water Quality • {timeAgo}
        </Typography>
      )}

      <Grid container spacing={1}>
        {parameters.map(param => (
           <Grid item xs={4} key={param}>
             <Box sx={{ p: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
                <ParameterIndicator
                    parameter={getLabel(param)}
                    value={waterQuality[param]}
                    unit={getUnit(param)}
                    status={getParamStatus(param, waterQuality[param])}
                    size="small"
                    showIcon={true}
                />
             </Box>
           </Grid>
        ))}
      </Grid>
    </Box>
  );
}
