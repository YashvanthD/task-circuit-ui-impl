import React from 'react';
import { Paper, Typography, Button, Stack, Card, CardContent, CardActionArea, Grid, Dialog } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function DatasetPage() {
  const navigate = useNavigate();

  return (
    <Paper sx={{ padding: 4, maxWidth: 1000, margin: '40px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dataset
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Create and manage new kinds of fish and pets in the database.
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardActionArea onClick={() => navigate('/taskcircuit/user/fish')}>
              <CardContent>
                <Typography variant="h6">Manage Fish Data</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  View, edit, and add fish records.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardActionArea disabled>
              <CardContent>
                <Typography variant="h6">Manage Pond Data</Typography>
                <Typography variant="body2" color="text.secondary">
                  (Coming soon)
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
}
