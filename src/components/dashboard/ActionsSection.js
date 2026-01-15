/**
 * ActionsSection Component
 * Displays quick action cards for navigation.
 *
 * @module components/dashboard/ActionsSection
 */

import React from 'react';
import { Paper, Typography, Grid, Card, CardContent } from '@mui/material';

/**
 * ActionsSection - Quick action navigation cards.
 *
 * @param {Object} props
 * @param {Array} props.actions - List of action objects { label, to }
 * @param {Function} props.onNavigate - Navigation handler
 */
export default function ActionsSection({ actions = [], onNavigate }) {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Actions
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.label}>
            <Card
              sx={{
                cursor: 'pointer',
                p: 2,
                m: 2,
                '&:hover': {
                  boxShadow: 4,
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => onNavigate(action.to)}
            >
              <CardContent>
                <Typography variant="body1">{action.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

