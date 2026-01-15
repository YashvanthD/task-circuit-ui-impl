/**
 * UserStats Component
 * Displays user statistics summary.
 *
 * @module components/users/UserStats
 */

import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { computeUserStats } from '../../utils/helpers/users';

/**
 * UserStats - Displays user statistics.
 *
 * @param {Object} props
 * @param {Array} props.users - List of users
 */
export default function UserStats({ users = [] }) {
  const stats = computeUserStats(users);

  const statItems = [
    { label: 'Total Users', value: stats.total, color: 'text.primary' },
    { label: 'Active', value: stats.active, color: 'success.main' },
    { label: 'Admins', value: stats.admins, color: 'error.main' },
    { label: 'Managers', value: stats.managers, color: 'info.main' },
    { label: 'Operators', value: stats.operators, color: 'success.main' },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {statItems.map((item) => (
        <Grid item xs={6} sm={4} md={2.4} key={item.label}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color={item.color}>
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

