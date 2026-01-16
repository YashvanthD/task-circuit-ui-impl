/**
 * DashboardHeader Component
 * Header section for dashboard with title and refresh button.
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
        mb: 3,
      }}
    >
      {/* Left: Title and Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: 'primary.lighter',
            color: 'primary.main',
          }}
        >
          <DashboardIcon fontSize="medium" />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
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

