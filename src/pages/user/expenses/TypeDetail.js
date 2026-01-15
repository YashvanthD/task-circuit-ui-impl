import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Box, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import data from '../../../data/expenses.json';
import {
  BASE_APP_PATH_USER_EXPENSES
} from '../../../config';

export default function TypeDetail() {
  const { category, type } = useParams();
  const navigate = useNavigate();
  const cat = decodeURIComponent(category || '');
  const t = decodeURIComponent(type || '');
  const node = (data[cat] && data[cat][t]) || {};
  const keys = Object.keys(node);

  return (
    <Paper sx={{ p: 4, maxWidth: 1000, margin: '24px auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">{t}</Typography>
        <Button variant="outlined" onClick={() => navigate(`${BASE_APP_PATH_USER_EXPENSES}/${encodeURIComponent(cat)}`)}>Back to {cat}</Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Sub-types / items</Typography>

      <List>
        {keys.map(k => (
          <ListItem key={k}>
            <ListItemText primary={k} />
          </ListItem>
        ))}
        {keys.length === 0 && <Typography variant="body2">No sub-types for this type.</Typography>}
      </List>
    </Paper>
  );
}
