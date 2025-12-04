/**
 * Home page component.
 * @returns {JSX.Element}
 */
import React from 'react';
import Card from '../components/Card';
import { Box, Typography } from '@mui/material';

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
      }}
    >
      <Card
        sx={{
          minWidth: { xs: 280, sm: 350 },
          maxWidth: 400,
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          boxShadow: 6,
          transition: 'transform 0.4s',
          '&:hover': { transform: 'scale(1.03)' },
          background: 'rgba(255,255,255,0.95)',
        }}
      >
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, color: '#1976d2' }}>
          Welcome Home!
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          You are now logged in. This page demonstrates a reusable Card component and Material UI layout.
        </Typography>
      </Card>
    </Box>
  );
}
