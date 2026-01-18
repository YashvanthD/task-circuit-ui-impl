/**
 * DashboardHeader Component
 * Header section for dashboard with title and refresh button.
 * Mobile-first responsive design.
 *
 * @module components/dashboard/DashboardHeader
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { refreshAllDashboardData } from '../../utils/helpers/dashboard';

// ============================================================================
// Component
// ============================================================================

export default function DashboardHeader({
  title = 'Dashboard',
  subtitle,
  onRefresh,
  showRefresh = true,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      // Call custom onRefresh if provided, otherwise use default
      if (onRefresh) {
        await onRefresh();
      } else {
        await refreshAllDashboardData();
      }
    } catch (error) {
      console.error('[DashboardHeader] Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, onRefresh]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: { xs: 2, sm: 3 },
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {/* Left: Title and Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            borderRadius: 2,
            bgcolor: 'primary.lighter',
            color: 'primary.main',
          }}
        >
          <DashboardIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </Box>
        <Box>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            fontWeight={600}
            sx={{ lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right: Refresh Button */}
      {showRefresh && (
        <Tooltip title={refreshing ? 'Refreshing...' : 'Refresh dashboard data'}>
          <span>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                bgcolor: 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              {refreshing ? (
                <CircularProgress size={24} color="primary" />
              ) : (
                <RefreshIcon />
              )}
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}

