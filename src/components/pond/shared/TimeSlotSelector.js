/**
 * TimeSlotSelector - Select feeding/activity time slot
 */
import React from 'react';
import { ToggleButtonGroup, ToggleButton, Box, Typography } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny'; // Morning
import WbTwilightIcon from '@mui/icons-material/WbTwilight'; // Evening/Afternoon
import DarkModeIcon from '@mui/icons-material/DarkMode'; // Night

export default function TimeSlotSelector({
  value,
  onChange,
  slots = ['Morning', 'Afternoon', 'Evening'],
  showIcons = true,
}) {
  const getIcon = (slot) => {
    const lower = slot.toLowerCase();
    if (lower.includes('morn')) return <WbSunnyIcon sx={{ mr: 1 }} />;
    if (lower.includes('after')) return <WbTwilightIcon sx={{ mr: 1 }} />;
    return <DarkModeIcon sx={{ mr: 1 }} />;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(e, newVal) => newVal && onChange(newVal)}
        aria-label="time slot"
        fullWidth
        sx={{
          mb: 1,
          '& .MuiToggleButton-root': {
            py: { xs: 1, sm: 1.5 },
            px: { xs: 1, sm: 2 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 0.5, sm: 1 },
            '& .MuiSvgIcon-root': {
              mr: { xs: 0, sm: 1 },
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }
          }
        }}
      >
        {slots.map(slot => (
          <ToggleButton key={slot} value={slot.toLowerCase()} aria-label={slot}>
            {showIcons && getIcon(slot)}
            {slot}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
