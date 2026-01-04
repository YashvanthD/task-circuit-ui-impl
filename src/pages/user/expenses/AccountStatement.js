import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

export default function AccountStatement() {
  return (
    <Paper sx={{ p: 4, maxWidth: 1000, margin: '24px auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Account Statement</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>All transactions for the organization. (Placeholder)</Typography>
      <List>
        <ListItem>
          <ListItemText primary="No transactions available" secondary="This is a placeholder view. Implement API integration to list all transactions." />
        </ListItem>
      </List>
    </Paper>
  );
}

