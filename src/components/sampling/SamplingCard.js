/**
 * SamplingCard Component
 * Displays a single sampling record.
 *
 * @module components/sampling/SamplingCard
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
import ScienceIcon from '@mui/icons-material/Science';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PoolIcon from '@mui/icons-material/Pool';

import {
  getSamplingStatusConfig,
  isSamplingOverdue,
  getTimeUntilSampling,
} from '../../utils/helpers/sampling';
import { SAMPLING_STATUS } from '../../constants';

// ============================================================================
// Main Component
// ============================================================================

/**
 * SamplingCard - A reusable sampling display card
 *
 * @param {Object} props
 * @param {Object} props.sampling - Sampling object
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 * @param {Function} props.getPondName - Function to get pond name from ID
 * @param {boolean} props.compact - Compact view mode
 */
export default function SamplingCard({
  sampling,
  onEdit,
  onDelete,
  getPondName = (id) => id || 'Unknown Pond',
  compact = false,
}) {
  const statusConfig = getSamplingStatusConfig(sampling.status);
  const isOverdue = isSamplingOverdue(sampling);
  const timeUntil = getTimeUntilSampling(sampling);
  const isCompleted = sampling.status === SAMPLING_STATUS.COMPLETED;
  const isCancelled = sampling.status === SAMPLING_STATUS.CANCELLED;

  if (compact) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${isOverdue ? '#f44336' : statusConfig.color}`,
          backgroundColor: isCancelled ? '#fafafa' : '#fff',
          opacity: isCancelled ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          '&:hover': { boxShadow: 3 },
        }}
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
            {sampling.sample_type || 'Sample'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getPondName(sampling.pond_id)} • {timeUntil}
          </Typography>
        </Box>

        <Chip
          label={statusConfig.label}
          size="small"
          sx={{ bgcolor: statusConfig.bg, color: statusConfig.color }}
        />

        {isOverdue && <Chip label="Overdue" size="small" color="error" />}

        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => onEdit?.(sampling)}>
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
        backgroundColor: isCancelled ? '#fafafa' : '#fff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        opacity: isCancelled ? 0.7 : 1,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${statusConfig.bg} 0%, ${statusConfig.color}22 100%)`,
          borderBottom: `3px solid ${isOverdue ? '#f44336' : statusConfig.color}`,
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <ScienceIcon sx={{ color: statusConfig.color }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {sampling.sample_type || 'Sample'}
          </Typography>
        </Stack>
        <Chip
          label={statusConfig.label}
          size="small"
          sx={{ bgcolor: 'white', color: statusConfig.color, fontWeight: 600 }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PoolIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Pond: {getPondName(sampling.pond_id)}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarTodayIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {sampling.scheduled_date
                ? new Date(sampling.scheduled_date).toLocaleDateString()
                : 'No date set'}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: isOverdue ? 'error.main' : 'text.secondary',
              fontWeight: isOverdue ? 600 : 400,
            }}
          >
            {timeUntil}
          </Typography>
        </Stack>

        {sampling.notes && (
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
            {sampling.notes}
          </Typography>
        )}

        {isOverdue && (
          <Chip label="Overdue" size="small" color="error" sx={{ mt: 1, alignSelf: 'flex-start' }} />
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        {!isCompleted && !isCancelled && (
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit?.(sampling)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete?.(sampling)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

