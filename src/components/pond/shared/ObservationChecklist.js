/**
 * ObservationChecklist - Quick observation checkboxes
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import { FormRadio } from '../../common';

export default function ObservationChecklist({
  values,
  onChange,
  categories = ['Fish Activity', 'Water Color', 'Smell', 'Visibility'],
}) {
  const options = {
    'Fish Activity': [
      { value: 'normal', label: 'Normal' },
      { value: 'sluggish', label: 'Sluggish' },
      { value: 'aggressive', label: 'Aggressive' },
    ],
    'Water Color': [
      { value: 'clear', label: 'Clear' },
      { value: 'green', label: 'Green' },
      { value: 'brown', label: 'Brown' },
      { value: 'cloudy', label: 'Cloudy' },
    ],
    'Smell': [
      { value: 'normal', label: 'Normal' },
      { value: 'bad', label: 'Bad/Off' },
    ],
    'Visibility': [
      { value: 'good', label: 'Good (>30cm)' },
      { value: 'poor', label: 'Poor (<20cm)' },
    ]
  };

  const handleChange = (category, value) => {
    const key = category.toLowerCase().replace(' ', '_');
    onChange(key, value);
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Observations</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {categories.map(cat => (
          <FormRadio
            key={cat}
            label={cat}
            name={cat.toLowerCase().replace(' ', '_')}
            value={values[cat.toLowerCase().replace(' ', '_')] || options[cat][0].value}
            options={options[cat]}
            onChange={(e) => handleChange(cat, e.target.value)}
            row={false}
          />
        ))}
      </Box>
    </Box>
  );
}
