import React from 'react';
import { Card, CardContent, Typography, Stack } from '@mui/material';

export default function Sampling({ data }) {
  const d = data || { pond: 'Pond 1', species: 'Tilapia', count: 10, avg_weight: 120 };
  return (
    <Card variant="outlined" sx={{ p: 1 }}>
      <CardContent>
        <Typography variant="h6">{d.species}</Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2">Pond: {d.pond}</Typography>
          <Typography variant="body2">Count: {d.count}</Typography>
          <Typography variant="body2">Avg wt: {d.avg_weight} g</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

