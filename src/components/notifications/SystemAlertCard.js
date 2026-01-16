/**
 * SystemAlertCard Component
 * Single alert card for system alerts.
 * Alerts are different from notifications - they need acknowledgment.
 *
 * @module components/notifications/SystemAlertCard
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MoreVert as MoreIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenIcon,
  WaterDrop as PondIcon,
  Assignment as TaskIcon,
  AccountBalance as ExpenseIcon,
  Settings as SystemIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// Constants
// ============================================================================

const TYPE_CONFIG = {
  info: { icon: InfoIcon, color: '#2196F3', bgColor: '#E3F2FD' },
  success: { icon: SuccessIcon, color: '#4CAF50', bgColor: '#E8F5E9' },
  warning: { icon: WarningIcon, color: '#FF9800', bgColor: '#FFF3E0' },
  error: { icon: ErrorIcon, color: '#F44336', bgColor: '#FFEBEE' },
  critical: { icon: ErrorIcon, color: '#D32F2F', bgColor: '#FFCDD2' },
};

const SEVERITY_COLORS = {
  low: '#9E9E9E',
  medium: '#FF9800',
  high: '#F44336',
  critical: '#D32F2F',
};

const SOURCE_ICONS = {
  system: SystemIcon,
  pond: PondIcon,
  task: TaskIcon,
  expense: ExpenseIcon,
};

// ============================================================================
// Component
// ============================================================================

export default function SystemAlertCard({
  alert,
  onAcknowledge,
  onDelete,
  onViewSource,
  compact = false,
  isAdmin = false,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const {
    alert_id,
    title,
    message,
    type = 'warning',
    severity = 'medium',
    source = 'system',
    source_id,
    acknowledged,
    acknowledged_by,
    acknowledged_at,
    created_at,
  } = alert;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.warning;
  const TypeIcon = config.icon;
  const SourceIcon = SOURCE_ICONS[source] || SystemIcon;

  // Format timestamp
  const timeAgo = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : '';

  // Handlers
  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAcknowledge = (e) => {
    e.stopPropagation();
    onAcknowledge?.(alert_id);
    handleMenuClose();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(alert_id);
    handleMenuClose();
  };

  const handleViewSource = (e) => {
    e.stopPropagation();
    onViewSource?.(alert);
  };

  const handleCardClick = () => {
    if (source_id) {
      onViewSource?.(alert);
    }
  };

  return (
    <Card
      sx={{
        mb: 1.5,
        cursor: source_id ? 'pointer' : 'default',
        borderLeft: `4px solid ${SEVERITY_COLORS[severity]}`,
        bgcolor: acknowledged ? 'background.paper' : config.bgColor,
        transition: 'all 0.2s ease',
        opacity: acknowledged ? 0.8 : 1,
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
        },
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent sx={{ py: compact ? 1.5 : 2, px: 2, '&:last-child': { pb: compact ? 1.5 : 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Icon */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: compact ? 36 : 44,
                height: compact ? 36 : 44,
                bgcolor: config.bgColor,
                color: config.color,
              }}
            >
              <TypeIcon />
            </Avatar>
            {/* Source indicator */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: 'background.paper',
                border: '2px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SourceIcon sx={{ fontSize: 10, color: 'text.secondary' }} />
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant={compact ? 'body2' : 'subtitle2'}
                  fontWeight={acknowledged ? 500 : 700}
                  noWrap
                >
                  {title}
                </Typography>
                <Chip
                  label={severity}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: `${SEVERITY_COLORS[severity]}20`,
                    color: SEVERITY_COLORS[severity],
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1, flexShrink: 0 }}
              >
                {timeAgo}
              </Typography>
            </Box>

            {/* Message */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: compact ? 1 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {message}
            </Typography>

            {/* Acknowledged info */}
            {acknowledged && acknowledged_at && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Acknowledged {formatDistanceToNow(new Date(acknowledged_at), { addSuffix: true })}
                {acknowledged_by && ` by ${acknowledged_by}`}
              </Typography>
            )}

            {/* Actions - show on hover or always on mobile */}
            <Collapse in={isHovered || !compact}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {/* View source button */}
                {source_id && (
                  <Chip
                    label={`View ${source}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={handleViewSource}
                    icon={<OpenIcon sx={{ fontSize: 16 }} />}
                    sx={{ height: 26, textTransform: 'capitalize' }}
                  />
                )}

                {/* Acknowledge button */}
                {!acknowledged && (
                  <Tooltip title="Acknowledge">
                    <IconButton size="small" onClick={handleAcknowledge} color="success">
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Delete button (admin only) */}
                {isAdmin && (
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={handleDelete} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {/* More options */}
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>
            </Collapse>
          </Box>
        </Box>
      </CardContent>

      {/* More options menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {!acknowledged && (
          <MenuItem onClick={handleAcknowledge}>
            <ListItemIcon><CheckIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Acknowledge</ListItemText>
          </MenuItem>
        )}
        {source_id && (
          <MenuItem onClick={handleViewSource}>
            <ListItemIcon><OpenIcon fontSize="small" /></ListItemIcon>
            <ListItemText>View {source}</ListItemText>
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}


