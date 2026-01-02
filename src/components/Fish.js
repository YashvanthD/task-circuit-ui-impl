import React from 'react';
import { Paper, Typography, Stack, Box, Avatar } from '@mui/material';
import PoolIcon from '@mui/icons-material/Pool';
import { formatDate } from '../utils/formatters';

export default function Fish({ initialData = {} }) {
  const name = initialData.common_name || initialData.name || 'Fish';
  const sci = initialData.scientific_name || '';
  const count = initialData.count || 0;
  const ponds = Array.isArray(initialData.ponds) ? initialData.ponds.join(', ') : '';
  const date = initialData.capture_date ? formatDate(initialData.capture_date) : '';

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: 'primary.main' }}><PoolIcon /></Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">{name}</Typography>
          <Typography variant="body2" color="text.secondary">{sci}</Typography>
          <Typography variant="caption">Count: {count} • Ponds: {ponds}</Typography>
        </Box>
        <Box>
          <Typography variant="caption">Captured: {date}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

