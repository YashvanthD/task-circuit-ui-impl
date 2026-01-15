/**
 * PondCard Component
 * Displays a single pond with status, stats, and actions.
 *
 * @module components/pond/PondCard
 */

import React from 'react';
import {
  Paper,
  Typography,
  Stack,
  Chip,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PoolIcon from '@mui/icons-material/Pool';
import SetMealIcon from '@mui/icons-material/SetMeal';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { getPondStatusConfig, formatPondSize, formatFishCount } from '../../utils/helpers/pond';
import { POND_STATUS } from '../../constants';

// ============================================================================
// Sub-components
// ============================================================================

function StatusBadge({ status }) {
  const config = getPondStatusConfig(status);

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        '& .MuiChip-label': { px: 1 },
      }}
      icon={<span style={{ fontSize: '0.9rem', marginLeft: 8 }}>{config.icon}</span>}
    />
  );
}

function PondMeta({ pond }) {
  return (
    <Stack spacing={0.5} sx={{ mt: 1 }}>
      {pond.location && (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <LocationOnIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {pond.location}
          </Typography>
        </Stack>
      )}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <PoolIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Size: {formatPondSize(pond.size)}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <SetMealIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Fish: {formatFishCount(pond.fish_count)} {pond.fish_type ? `(${pond.fish_type})` : ''}
        </Typography>
      </Stack>
    </Stack>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * PondCard - A reusable pond display card
 *
 * @param {Object} props
 * @param {Object} props.pond - Pond object
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 * @param {Function} props.onClick - Click callback
 * @param {boolean} props.compact - Compact view mode
 */
export default function PondCard({
  pond,
  onEdit,
  onDelete,
  onClick,
  compact = false,
}) {
  const statusConfig = getPondStatusConfig(pond.status);
  const isInactive = pond.status === POND_STATUS.INACTIVE;

  if (compact) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${statusConfig.borderColor}`,
          backgroundColor: isInactive ? '#fafafa' : '#fff',
          opacity: isInactive ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': { boxShadow: onClick ? 3 : 1 },
        }}
        onClick={onClick}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: statusConfig.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ fontSize: '1.2rem' }}>{statusConfig.icon}</Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
            {pond.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFishCount(pond.fish_count)} fish • {formatPondSize(pond.size)}
          </Typography>
        </Box>

        <StatusBadge status={pond.status} />

        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit?.(pond); }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>
    );
  }

  // Full card view
  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: isInactive ? '#fafafa' : '#fff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : 'none',
          boxShadow: onClick ? 6 : 2,
        },
        opacity: isInactive ? 0.8 : 1,
      }}
      onClick={onClick}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${statusConfig.bg} 0%, ${statusConfig.borderColor}22 100%)`,
          borderBottom: `3px solid ${statusConfig.borderColor}`,
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: '1.5rem' }}>{statusConfig.icon}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {pond.name}
          </Typography>
        </Stack>
        <StatusBadge status={pond.status} />
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PondMeta pond={pond} />

        {pond.notes && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {pond.notes}
          </Typography>
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(pond);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(pond);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Paper>
  );
}

