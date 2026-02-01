/**
 * AlertCard Component - Modern user-friendly design
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Stack,
} from '@mui/material';
import {
  ErrorOutline as CriticalIcon,
  WarningAmber as HighIcon,
  Info as MediumIcon,
  CheckCircleOutline as LowIcon,
  AccessTime as TimeIcon,
  CheckCircle as ResolvedIcon,
  Close as CloseIcon,
  Done as DoneIcon,
} from '@mui/icons-material';
import { formatTimestamp } from '../../utils/helpers';

const SEVERITY_CONFIG = {
  critical: {
    color: '#d32f2f',
    bgColor: '#ffebee',
    icon: CriticalIcon,
    label: 'Critical',
    gradient: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
  },
  high: {
    color: '#f57c00',
    bgColor: '#fff3e0',
    icon: HighIcon,
    label: 'High',
    gradient: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
  },
  medium: {
    color: '#1976d2',
    bgColor: '#e3f2fd',
    icon: MediumIcon,
    label: 'Medium',
    gradient: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
  },
  low: {
    color: '#388e3c',
    bgColor: '#e8f5e9',
    icon: LowIcon,
    label: 'Low',
    gradient: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)',
  },
};

function getSeverity(alert) {
  const sev = (alert.severity || 'medium').toLowerCase();
  return SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.medium;
}

function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatTimestamp(timestamp);
  } catch {
    return '';
  }
}

export default function AlertCard({ alert, onResolve, onDelete, onClick }) {
  const config = getSeverity(alert);
  const SeverityIcon = config.icon;

  const isResolved = alert.status === 'resolved' || alert.resolved;
  const title = alert.title || 'Alert';
  const message = alert.message || '';
  const timeAgo = getTimeAgo(alert.created_at);
  const category = alert.category || alert.type || '';

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'visible',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          borderColor: config.color,
          boxShadow: `0 4px 20px ${alpha(config.color, 0.15)}`,
          transform: 'translateY(-2px)',
        },
        opacity: isResolved ? 0.6 : 1,
      }}
      onClick={onClick}
    >
      {/* Severity indicator bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          background: config.gradient,
        }}
      />

      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
          {/* Header with icon and actions */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            {/* Severity icon */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: config.bgColor,
                flexShrink: 0,
              }}
            >
              <SeverityIcon sx={{ fontSize: 22, color: config.color }} />
            </Box>

            {/* Title and category */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{
                  color: 'text.primary',
                  mb: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textDecoration: isResolved ? 'line-through' : 'none',
                }}
              >
                {title}
              </Typography>

              {category && (
                <Chip
                  label={category}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    textTransform: 'capitalize',
                  }}
                />
              )}
            </Box>

            {/* Action buttons */}
            <Stack direction="row" spacing={0.5}>
              {!isResolved && onResolve && (
                <Tooltip title="Resolve">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolve(alert.alert_id);
                    }}
                    sx={{
                      color: 'success.main',
                      '&:hover': { bgcolor: alpha('#4caf50', 0.1) },
                    }}
                  >
                    <DoneIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onDelete && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(alert.alert_id);
                    }}
                    sx={{
                      color: 'error.main',
                      '&:hover': { bgcolor: alpha('#d32f2f', 0.1) },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>

          {/* Message */}
          {message && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                pl: 7,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}
            >
              {message}
            </Typography>
          )}

          {/* Footer */}
          <Box
            sx={{
              pl: 7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            {/* Time and severity badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {timeAgo && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo}
                  </Typography>
                </Box>
              )}

              <Chip
                label={config.label}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: alpha(config.color, 0.1),
                  color: config.color,
                }}
              />
            </Box>

            {/* Status badge */}
            {isResolved && (
              <Chip
                icon={<ResolvedIcon sx={{ fontSize: 14 }} />}
                label="Resolved"
                size="small"
                color="success"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

