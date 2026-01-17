/**
 * FishCard Component
 * Displays a single fish species record with details and actions.
 *
 * @module components/fish/FishCard
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
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SetMealIcon from '@mui/icons-material/SetMeal';
import PoolIcon from '@mui/icons-material/Pool';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScienceIcon from '@mui/icons-material/Science';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { formatDate } from '../../utils/helpers/formatters';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get fish status configuration
 */
function getFishStatusConfig(status) {
  const configs = {
    active: { label: 'Active', color: '#2e7d32', bg: '#e8f5e9', icon: '🐟' },
    inactive: { label: 'Inactive', color: '#757575', bg: '#f5f5f5', icon: '💤' },
    harvested: { label: 'Harvested', color: '#1565c0', bg: '#e3f2fd', icon: '🎣' },
    sold: { label: 'Sold', color: '#6a1b9a', bg: '#f3e5f5', icon: '💰' },
    default: { label: 'Unknown', color: '#9e9e9e', bg: '#fafafa', icon: '❓' },
  };
  return configs[status?.toLowerCase()] || configs.default;
}

/**
 * Format fish count with units
 */
function formatFishCount(count) {
  if (!count && count !== 0) return '-';
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

// ============================================================================
// Sub-components
// ============================================================================

function StatusBadge({ status }) {
  const config = getFishStatusConfig(status);

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

function FishMeta({ fish }) {
  const ponds = Array.isArray(fish.ponds) ? fish.ponds.join(', ') : (fish.ponds || '-');

  return (
    <Stack spacing={0.5} sx={{ mt: 1 }}>
      {fish.scientific_name && (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <ScienceIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            {fish.scientific_name}
          </Typography>
        </Stack>
      )}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <SetMealIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Count: {formatFishCount(fish.count || fish.total_count)}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <PoolIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Ponds: {ponds}
        </Typography>
      </Stack>
      {fish.capture_date && (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <CalendarTodayIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Captured: {formatDate(fish.capture_date)}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * FishCard - A reusable fish display card
 *
 * @param {Object} props
 * @param {Object} props.fish - Fish object
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 * @param {Function} props.onClick - Click callback
 * @param {Function} props.onViewDetails - View details callback
 * @param {boolean} props.compact - Compact view mode
 */
export default function FishCard({
  fish,
  onEdit,
  onDelete,
  onClick,
  onViewDetails,
  compact = false,
}) {
  const statusConfig = getFishStatusConfig(fish.status);
  const isInactive = fish.status === 'inactive';
  const commonName = fish.common_name || fish.name || 'Unknown Fish';

  if (compact) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${statusConfig.color}`,
          bgcolor: isInactive ? 'action.disabledBackground' : 'background.paper',
          opacity: isInactive ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': { boxShadow: 3 },
        }}
        onClick={onClick}
      >
        <Avatar
          sx={{
            bgcolor: statusConfig.bg,
            color: statusConfig.color,
            width: 40,
            height: 40,
          }}
        >
          <SetMealIcon />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
            {commonName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {fish.scientific_name || '-'} • Count: {formatFishCount(fish.count)}
          </Typography>
        </Box>

        <StatusBadge status={fish.status} />

        {(onEdit || onDelete) && (
          <Stack direction="row" spacing={0.5}>
            {onEdit && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(fish);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(fish);
                  }}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}
      </Paper>
    );
  }

  // Full card view
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: isInactive ? 'action.disabledBackground' : 'background.paper',
        opacity: isInactive ? 0.8 : 1,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={onClick}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: statusConfig.bg,
              color: statusConfig.color,
              width: 56,
              height: 56,
            }}
          >
            <SetMealIcon sx={{ fontSize: '1.8rem' }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {commonName}
            </Typography>
            {fish.id && (
              <Typography variant="caption" color="text.secondary">
                ID: {fish.id}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <StatusBadge status={fish.status} />
          {onViewDetails && (
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(fish);
                }}
              >
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(fish);
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(fish);
                }}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      <FishMeta fish={fish} />

      {/* Additional info section */}
      {(fish.average_weight || fish.avg_weight) && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Avg Weight
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {fish.average_weight || fish.avg_weight} g
              </Typography>
            </Box>
            {fish.total_weight && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Weight
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {(fish.total_weight / 1000).toFixed(2)} kg
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {fish.notes && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="caption" color="text.secondary">
            Notes
          </Typography>
          <Typography variant="body2">{fish.notes}</Typography>
        </Box>
      )}
    </Paper>
  );
}

