/**
 * AlertCard Component
 * Displays a single alert/task card with priority/severity styling.
 * Supports both task alerts (priority) and system alerts (severity).
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
  Error as CriticalIcon,
} from '@mui/icons-material';
import { formatTimestamp } from '../../utils/helpers/date';

// Priority/Severity configuration
const SEVERITY_CONFIG = {
  critical: {
    color: '#9c27b0',
    icon: CriticalIcon,
    label: 'Critical',
  },
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
 * Get severity/priority key from alert data
 * Handles both task alerts (priority) and system alerts (severity)
 */
function getSeverityKey(alert) {
  // Check severity first (system alerts)
  const severity = alert.severity;
  if (typeof severity === 'string' && severity.trim()) {
    return severity.toLowerCase();
  }

  // Check priority (task alerts) - handle both string and number
  const priority = alert.priority;
  if (priority !== undefined && priority !== null) {
    if (typeof priority === 'string' && priority.trim()) {
      const lower = priority.toLowerCase();
      // Map priority names to severity keys
      if (['critical', 'high', 'medium', 'low'].includes(lower)) {
        return lower;
      }
      // Handle priority numbers as strings
      const num = parseInt(priority, 10);
      if (!isNaN(num)) {
        if (num <= 1) return 'high';
        if (num === 2) return 'medium';
        return 'low';
      }
      return lower;
    }
    if (typeof priority === 'number') {
      if (priority <= 1) return 'high';
      if (priority === 2) return 'medium';
      return 'low';
    }
  }

  return 'default';
}

/**
 * AlertCard - Single alert display card.
 * Touch-friendly card with improved visual hierarchy.
 * Works with both task alerts and system alerts.
 *
 * @param {Object} props
 * @param {Object} props.alert - Alert data (task or system alert)
 * @param {Function} props.onClick - Click handler
 */
export default function AlertCard({ alert, onClick }) {
  const severityKey = getSeverityKey(alert);
  const config = SEVERITY_CONFIG[severityKey] || SEVERITY_CONFIG.default;
  const SeverityIcon = config.icon;

  // Status flags
  const isAcknowledged = alert.acknowledged;
  const isResolved = alert.resolved;
  const isUnread = alert.unread;


  // Get title and description
  const title = alert.title || alert.name || 'Alert';
  const description = alert.message || alert.description || alert.content || '';

  // Get due date (for tasks) or created date (for system alerts)
  const dueDate = alert.completeBy || alert.due_date;
  const createdAt = alert.created_at || alert.createdAt;

  // Get alert type or source
  const alertType = alert.alert_type || alert.type || alert.source;

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
        opacity: isResolved ? 0.5 : isAcknowledged ? 0.7 : 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4,
          height: '100%',
          bgcolor: isResolved ? 'success.main' : isAcknowledged ? 'info.main' : config.color,
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
          {/* Header: Title and Severity */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight={isUnread || (!isAcknowledged && !isResolved) ? 700 : 600}
              color={isUnread ? 'error.main' : isResolved ? 'text.disabled' : 'text.primary'}
              sx={{
                flex: 1,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textDecoration: isResolved ? 'line-through' : 'none',
              }}
            >
              {title}
            </Typography>
            <Chip
              icon={<SeverityIcon sx={{ fontSize: 14 }} />}
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
          {description && (
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
              {description}
            </Typography>
          )}

          {/* Footer: Alert type, due date, or created date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            {alertType && (
              <Chip
                label={alertType.replace(/_/g, ' ')}
                size="small"
                variant="outlined"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  textTransform: 'capitalize',
                }}
              />
            )}

            {dueDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ScheduleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary">
                  Due: {formatTimestamp(dueDate)}
                </Typography>
              </Box>
            )}

            {!dueDate && createdAt && (
              <Typography variant="caption" color="text.disabled">
                {formatTimestamp(createdAt)}
              </Typography>
            )}

            {isResolved && (
              <Chip
                label="Resolved"
                size="small"
                color="success"
                sx={{ height: 18, fontSize: '0.6rem' }}
              />
            )}

            {!isResolved && isAcknowledged && (
              <Chip
                label="Acknowledged"
                size="small"
                color="info"
                sx={{ height: 18, fontSize: '0.6rem' }}
              />
            )}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}

