/**
 * DataTableToolbar Component
 * Toolbar with dense mode toggle, selection info, and bulk actions
 */

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ViewCompact as ViewCompactIcon,
  ViewHeadline as ViewHeadlineIcon,
} from '@mui/icons-material';
import ActionButton from '../ActionButton';

export default function DataTableToolbar({
  selectedCount,
  totalCount,
  bulkActions,
  denseMode,
  onDenseModeToggle,
  showDenseToggle,
  onClearSelection,
}) {
  // Only show toolbar if there's selection or dense toggle is enabled
  if (selectedCount === 0 && !showDenseToggle) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        p: 1.5,
        bgcolor: selectedCount > 0 ? 'primary.light' : 'background.default',
        borderRadius: 1,
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {/* Selection info and bulk actions */}
      {selectedCount > 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Chip
            label={`${selectedCount} selected`}
            color="primary"
            size="small"
            onDelete={onClearSelection}
          />

          {bulkActions && bulkActions.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {bulkActions.map((action, index) => (
                <ActionButton
                  key={index}
                  size="small"
                  variant={action.variant || 'outlined'}
                  color={action.color || 'primary'}
                  icon={action.icon}
                  onClick={action.onClick}
                >
                  {action.label}
                </ActionButton>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {totalCount} {totalCount === 1 ? 'row' : 'rows'}
          </Typography>
        </Box>
      )}

      {/* Dense mode toggle */}
      {showDenseToggle && (
        <Tooltip title={denseMode ? 'Normal view' : 'Compact view'}>
          <IconButton size="small" onClick={onDenseModeToggle}>
            {denseMode ? <ViewHeadlineIcon /> : <ViewCompactIcon />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
