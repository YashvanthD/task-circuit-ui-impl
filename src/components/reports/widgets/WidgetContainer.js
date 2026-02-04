/**
 * WidgetContainer Component
 * Container wrapper for dashboard widgets with drag handle and controls.
 *
 * @module components/reports/widgets/WidgetContainer
 */

import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Collapse,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/**
 * WidgetContainer - Wrapper for dashboard widgets
 *
 * @param {Object} props
 * @param {string} props.title - Widget title
 * @param {React.ReactNode} props.children - Widget content
 * @param {Function} props.onRemove - Remove callback
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onRefresh - Refresh callback
 * @param {Function} props.onHide - Hide callback
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.draggable - Enable drag handle
 * @param {boolean} props.collapsible - Enable collapse
 * @param {Object} props.sx - Additional styles
 */
export default function WidgetContainer({
  title,
  subtitle,
  children,
  onRemove,
  onEdit,
  onRefresh,
  onHide,
  loading = false,
  draggable = false,
  collapsible = true,
  headerActions,
  sx = {},
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAction = (action) => {
    handleMenuClose();
    action?.();
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 4,
        },
        ...sx,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
          minHeight: 48,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          {draggable && (
            <Tooltip title="Drag to reorder">
              <DragIndicatorIcon
                sx={{
                  color: 'text.secondary',
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' },
                }}
              />
            </Tooltip>
          )}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {headerActions}

          {collapsible && (
            <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          )}

          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {onRefresh && (
              <MenuItem onClick={() => handleAction(onRefresh)}>
                <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
                Refresh
              </MenuItem>
            )}
            {onEdit && (
              <MenuItem onClick={() => handleAction(onEdit)}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Edit
              </MenuItem>
            )}
            {onHide && (
              <MenuItem onClick={() => handleAction(onHide)}>
                <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
                Hide
              </MenuItem>
            )}
            {(onRemove && (onRefresh || onEdit || onHide)) && <Divider />}
            {onRemove && (
              <MenuItem onClick={() => handleAction(onRemove)} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Remove
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Box>

      {/* Content */}
      <Collapse in={!collapsed}>
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflow: 'auto',
            position: 'relative',
            minHeight: 150,
          }}
        >
          {loading ? (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.7)',
              }}
            >
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : (
            children
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
