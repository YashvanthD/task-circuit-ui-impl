/**
 * Landing page component.
 * @returns {JSX.Element}
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      <Typography variant="h3" gutterBottom>Welcome to the Landing Page</Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        This is a sample React web app using best practices. Click below to go to your Home Page.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/home')}>
        Go to Home
      </Button>
    </Box>
  );
}
