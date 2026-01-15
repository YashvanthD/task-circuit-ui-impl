/**
 * SamplingList Component
 * Renders a list of sampling cards.
 *
 * @module components/sampling/SamplingList
 */

import React from 'react';
import { Grid, Typography, CircularProgress, Stack } from '@mui/material';
import SamplingCard from './SamplingCard';

/**
 * SamplingList - Renders a list of samplings.
 *
 * @param {Object} props
 * @param {Array} props.samplings - List of samplings
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.getPondName - Get pond name from ID
 * @param {boolean} props.compact - Compact view mode
 */
export default function SamplingList({
  samplings = [],
  loading = false,
  onEdit,
  onDelete,
  getPondName,
  compact = false,
}) {
  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Loading samplings...
        </Typography>
      </Stack>
    );
  }

  if (samplings.length === 0) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          🔬
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No samplings found.
        </Typography>
      </Stack>
    );
  }

  if (compact) {
    return (
      <Stack spacing={2}>
        {samplings.map((sampling) => (
          <SamplingCard
            key={sampling.sampling_id || sampling.id}
            sampling={sampling}
            onEdit={onEdit}
            onDelete={onDelete}
            getPondName={getPondName}
            compact
          />
        ))}
      </Stack>
    );
  }

  return (
    <Grid container spacing={3}>
      {samplings.map((sampling) => (
        <Grid item xs={12} sm={6} md={4} key={sampling.sampling_id || sampling.id}>
          <SamplingCard
            sampling={sampling}
            onEdit={onEdit}
            onDelete={onDelete}
            getPondName={getPondName}
          />
        </Grid>
      ))}
    </Grid>
  );
}

