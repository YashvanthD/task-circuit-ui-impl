/**
 * ActionsSection Component
 * Displays quick action cards for navigation.
 * Mobile-first responsive design with touch-friendly cards.
 *
 * @module components/dashboard/ActionsSection
 */

import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Box,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Science as WaterTestIcon,
  Biotech as SamplingIcon,
  Transform as TransformIcon,
  Assignment as TaskIcon,
  Assessment as ReportsIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

// Icon mapping for actions
const ACTION_ICONS = {
  'Water Test': WaterTestIcon,
  'Sampling': SamplingIcon,
  'Transform': TransformIcon,
  'New Task': TaskIcon,
  'Reports': ReportsIcon,
};

// Color mapping for actions
const ACTION_COLORS = {
  'Water Test': '#2196F3', // Blue
  'Sampling': '#4CAF50',   // Green
  'Transform': '#FF9800',  // Orange
  'New Task': '#9C27B0',   // Purple
  'Reports': '#00BCD4',    // Cyan
};

/**
 * Single Action Card Component
 */
function ActionCard({ action, onNavigate, isMobile }) {
  const theme = useTheme();
  const Icon = ACTION_ICONS[action.label] || AddIcon;
  const color = ACTION_COLORS[action.label] || theme.palette.primary.main;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: color,
          boxShadow: `0 4px 20px ${alpha(color, 0.25)}`,
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      }}
    >
      <CardActionArea
        onClick={() => onNavigate(action.to)}
        sx={{
          height: '100%',
          p: isMobile ? 2 : 2.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            alignItems: isMobile ? 'center' : 'center',
            gap: isMobile ? 2 : 1.5,
            textAlign: isMobile ? 'left' : 'center',
          }}
        >
          {/* Icon Container */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? 48 : 56,
              height: isMobile ? 48 : 56,
              borderRadius: isMobile ? 2 : 3,
              bgcolor: alpha(color, 0.1),
              color: color,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: isMobile ? 24 : 28 }} />
          </Box>

          {/* Label and Arrow */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'space-between' : 'center',
              width: isMobile ? 'auto' : '100%',
            }}
          >
            <Typography
              variant={isMobile ? 'body1' : 'subtitle2'}
              fontWeight={600}
              color="text.primary"
              sx={{
                lineHeight: 1.3,
              }}
            >
              {action.label}
            </Typography>

            {/* Show arrow on mobile for better UX indication */}
            {isMobile && (
              <ChevronRightIcon
                sx={{
                  color: 'text.secondary',
                  ml: 1,
                }}
              />
            )}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}

/**
 * ActionsSection - Quick action navigation cards.
 * Responsive grid layout that adapts to mobile and desktop.
 *
 * @param {Object} props
 * @param {Array} props.actions - List of action objects { label, to }
 * @param {Function} props.onNavigate - Navigation handler
 */
export default function ActionsSection({ actions = [], onNavigate }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!actions.length) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 2, sm: 2.5 },
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
        >
          Quick Actions
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          {actions.length} actions available
        </Typography>
      </Box>

      {/* Actions Grid */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {actions.map((action) => (
          <Grid
            item
            xs={12}           // Full width on mobile (stacked list)
            sm={6}            // 2 columns on tablet
            md={4}            // 3 columns on small desktop
            lg={2.4}          // 5 columns on large desktop (equal distribution)
            key={action.label}
          >
            <ActionCard
              action={action}
              onNavigate={onNavigate}
              isMobile={isMobile}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

