/**
 * FeedingLogForm - Quick feeding entry
 */
import React from 'react';
import { Box, Typography, TextField, Checkbox, FormControlLabel, InputAdornment } from '@mui/material';
import TimeSlotSelector from '../../shared/TimeSlotSelector';

export default function FeedingLogForm({
  values,
  onChange,
  recommendedAmount = 0,
}) {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Feeding</Typography>

      <TimeSlotSelector
        value={values.time_slot}
        onChange={(val) => handleChange('time_slot', val)}
      />

      <Box sx={{
        display: 'flex',
        gap: 2,
        alignItems: { xs: 'center', sm: 'flex-start' },
        flexDirection: { xs: 'column', sm: 'row' },
        mt: 2
      }}>
        <TextField
          label="Amount"
          value={values.amount_kg || ''}
          onChange={(e) => handleChange('amount_kg', e.target.value)}
          type="number"
          fullWidth
          size="small"
          InputProps={{
            endAdornment: <InputAdornment position="end">kg</InputAdornment>,
          }}
          helperText={recommendedAmount ? `Recommended: ${recommendedAmount} kg` : ''}
        />

        <Box sx={{ flex: 1 }}>
           <FormControlLabel
             control={
               <Checkbox
                 checked={values.feeding_behavior === 'normal'}
                 onChange={(e) => handleChange('feeding_behavior', e.target.checked ? 'normal' : 'poor')}
                 size="small"
               />
             }
             label={<Typography variant="body2">Fish eating normally?</Typography>}
           />
        </Box>
      </Box>
    </Box>
  );
}
