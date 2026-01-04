import React from 'react';
import { Paper, Typography, List, ListItemButton, ListItemText, Box, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import data from '../../../data/expenses.json';

export default function CategoryList() {
  const { category } = useParams();
  const navigate = useNavigate();
  const decoded = decodeURIComponent(category || '');
  const types = data[decoded] || {};
  const keys = Object.keys(types);

  return (
    <Paper sx={{ p: 4, maxWidth: 1000, margin: '24px auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{decoded}</Typography>
        <Button variant="outlined" onClick={() => navigate('/taskcircuit/user/expenses')}>Back</Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select a type to view or manage expense items.</Typography>

      <List>
        {keys.map(k => (
          <ListItemButton key={k} onClick={() => navigate(`/taskcircuit/user/expenses/${encodeURIComponent(decoded)}/${encodeURIComponent(k)}`)}>
            <ListItemText primary={k} secondary={Object.keys(types[k] || {}).length ? `${Object.keys(types[k]).length} sub-types` : ''} />
          </ListItemButton>
        ))}
        {keys.length === 0 && <Typography variant="body2">No types defined for this category.</Typography>}
      </List>
    </Paper>
  );
}

