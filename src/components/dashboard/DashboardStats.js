/**
 * DashboardStats Component
 * Displays active and critical task statistics.
 * Mobile-first responsive design.
 *
 * @module components/dashboard/DashboardStats
 */

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Box,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Warning as CriticalIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

/**
 * Single Stat Card Component
 */
function StatCard({ title, value, color, icon: Icon, subtitle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: color,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              sx={{ mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              fontWeight={700}
              color={color}
              sx={{ lineHeight: 1.2 }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: 2,
              bgcolor: alpha(color, 0.1),
              color: color,
            }}
          >
            <Icon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/**
 * DashboardStats - Shows task statistics cards.
 * Responsive grid layout for mobile and desktop.
 *
 * @param {Object} props
 * @param {number} props.activeTasks - Number of active tasks
 * @param {number} props.criticalTasks - Number of critical tasks
 */
export default function DashboardStats({ activeTasks = 0, criticalTasks = 0 }) {
  const theme = useTheme();

  if (activeTasks === 0 && criticalTasks === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <TrendingUpIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No tasks available. Create your first task to get started!
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={6} md={6}>
        <StatCard
          title="Active Tasks"
          value={activeTasks}
          color={theme.palette.primary.main}
          icon={TaskIcon}
          subtitle="In progress"
        />
      </Grid>
      <Grid item xs={6} sm={6} md={6}>
        <StatCard
          title="Critical Tasks"
          value={criticalTasks}
          color={theme.palette.error.main}
          icon={CriticalIcon}
          subtitle="Needs attention"
        />
      </Grid>
    </Grid>
  );
}

