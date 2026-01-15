import React from 'react';
import { Paper, Typography, Grid, Card, CardActionArea, CardContent, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReceiptIcon from '@mui/icons-material/ReceiptLong';
import data from '../../../data/expenses.json';
import { BASE_APP_PATH_USER_EXPENSES } from '../../../config';

export default function ExpensesIndex() {
  const navigate = useNavigate();
  const categories = Object.keys(data || {});

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, margin: '24px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Expenses</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>Browse expense categories. Click a card to view types within that category.</Typography>

      <Grid container spacing={3}>
        {categories.map(cat => (
          <Grid key={cat} item xs={12} sm={6} md={4} lg={3}>
            <Card variant="outlined">
              <CardActionArea onClick={() => navigate(`${BASE_APP_PATH_USER_EXPENSES}/${encodeURIComponent(cat)}`)}>
                <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Stack sx={{ width: 64 }} alignItems="center" justifyContent="center">
                    <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Stack>
                  <Stack sx={{ flex: 1 }}>
                    <Typography variant="h6">{cat}</Typography>
                    <Typography variant="body2" color="text.secondary">{Object.keys(data[cat] || {}).length} types</Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
