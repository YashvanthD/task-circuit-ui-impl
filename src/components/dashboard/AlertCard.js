/**
 * AlertCard Component
 * Displays a single alert/task card with priority styling.
 * Mobile-first responsive design.
 *
 * @module components/dashboard/AlertCard
 */

import React from 'react';
import { Card, CardActionArea, Typography, Box, Chip, alpha } from '@mui/material';
import {
  PriorityHigh as HighPriorityIcon,
  Warning as MediumPriorityIcon,
  Info as LowPriorityIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { formatTimestamp } from '../../utils/helpers/date';

// Priority configuration
const PRIORITY_CONFIG = {
  high: {
    color: '#d32f2f',
    icon: HighPriorityIcon,
    label: 'High',
  },
  medium: {
    color: '#ed6c02',
    icon: MediumPriorityIcon,
    label: 'Medium',
  },
  low: {
    color: '#0288d1',
    icon: LowPriorityIcon,
    label: 'Low',
  },
  default: {
    color: '#757575',
    icon: LowPriorityIcon,
    label: 'Normal',
  },
};

/**
 * AlertCard - Single alert display card.
 * Touch-friendly card with improved visual hierarchy.
 *
 * @param {Object} props
 * @param {Object} props.alert - Alert data
 * @param {Function} props.onClick - Click handler
 */
export default function AlertCard({ alert, onClick }) {
  // Handle priority that might be a number, string, or undefined
  const rawPriority = alert.priority;
  let priorityKey = 'default';

  if (typeof rawPriority === 'string') {
    priorityKey = rawPriority.toLowerCase();
  } else if (typeof rawPriority === 'number') {
    // Map numeric priorities: 1=high, 2=medium, 3=low
    if (rawPriority <= 1) priorityKey = 'high';
    else if (rawPriority === 2) priorityKey = 'medium';
    else if (rawPriority >= 3) priorityKey = 'low';
  }

  const config = PRIORITY_CONFIG[priorityKey] || PRIORITY_CONFIG.default;
  const PriorityIcon = config.icon;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4,
          height: '100%',
          bgcolor: config.color,
        },
        '&:hover': {
          borderColor: config.color,
          boxShadow: `0 4px 12px ${alpha(config.color, 0.2)}`,
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: '100%',
          p: { xs: 1.5, sm: 2 },
          pl: { xs: 2.5, sm: 3 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Header: Title and Priority */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight={alert.unread ? 700 : 600}
              color={alert.unread ? 'error.main' : 'text.primary'}
              sx={{
                flex: 1,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {alert.title}
            </Typography>
            <Chip
              icon={<PriorityIcon sx={{ fontSize: 14 }} />}
              label={config.label}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.65rem',
                bgcolor: alpha(config.color, 0.1),
                color: config.color,
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: config.color,
                },
              }}
            />
          </Box>

          {/* Description */}
          {alert.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              }}
            >
              {alert.description}
            </Typography>
          )}

          {/* Due Date */}
          {alert.completeBy && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                Due: {formatTimestamp(alert.completeBy)}
              </Typography>
            </Box>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
}

