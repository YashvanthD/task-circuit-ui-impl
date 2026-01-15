import React from 'react';
import { Paper, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import {BASE_APP_PATH_USER_DASHBOARD} from "../../config";

export default function Unauthorized({ message = "You don't have access to view this page." }) {
  return (
    <Paper sx={{ p: 4, maxWidth: 900, margin: '48px auto', textAlign: 'center' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Access denied</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>{message}</Typography>
      <Box>
        <Button component={Link} to={BASE_APP_PATH_USER_DASHBOARD} variant="contained">Go to Dashboard</Button>
      </Box>
    </Paper>
  );
}

