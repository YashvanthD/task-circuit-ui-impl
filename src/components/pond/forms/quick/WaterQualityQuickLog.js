/**
 * WaterQualityQuickLog - Simplified WQ entry for field workers
 */
import React from 'react';
import { Box, Typography, Grid, TextField, InputAdornment } from '@mui/material';
import { ParameterRangeIndicator } from '../../../common/enhanced';

export default function WaterQualityQuickLog({
  values,
  onChange,
  showHeader = true,
}) {
  const handleChange = (param, value) => {
    onChange(param, value);
  };

  const parameters = [
    { id: 'temperature', label: 'Temperature', unit: '°C', min: 20, max: 35, optimal: [26, 30] },
    { id: 'ph', label: 'pH', unit: '', min: 0, max: 14, optimal: [6.5, 8.5] },
    { id: 'dissolved_oxygen', label: 'DO (Oxygen)', unit: 'mg/L', min: 0, max: 15, optimal: [5, 10] },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {showHeader && <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Water Quality (Quick)</Typography>}

      <Grid container spacing={2}>
        {parameters.map((param) => (
          <Grid item xs={12} sm={4} key={param.id}>
            <Box sx={{ mb: 1 }}>
              <TextField
                label={param.label}
                value={values[param.id] || ''}
                onChange={(e) => handleChange(param.id, e.target.value)}
                type="number"
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: param.unit ? <InputAdornment position="end">{param.unit}</InputAdornment> : null,
                }}
              />
            </Box>

            {values[param.id] && (
              <ParameterRangeIndicator
                value={Number(values[param.id])}
                min={param.min}
                max={param.max}
                optimal={param.optimal}
                label="Status"
                showValue={false}
                height={6}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
