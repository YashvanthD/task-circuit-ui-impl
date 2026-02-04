/**
 * FishDetailDialog Component
 * Dialog to display detailed fish information.
 *
 * @module components/fish/FishDetailDialog
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Stack,
  Box,
  Chip,
  Divider,
  Grid,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SetMealIcon from '@mui/icons-material/SetMeal';
import PoolIcon from '@mui/icons-material/Pool';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScaleIcon from '@mui/icons-material/Scale';
import CategoryIcon from '@mui/icons-material/Category';

import { formatDate } from '../../utils';

// ============================================================================
// Helper Functions
// ============================================================================

function getFishStatusConfig(status) {
  const configs = {
    active: { label: 'Active', color: '#2e7d32', bg: '#e8f5e9', icon: '🐟' },
    inactive: { label: 'Inactive', color: '#757575', bg: '#f5f5f5', icon: '💤' },
    harvested: { label: 'Harvested', color: '#1565c0', bg: '#e3f2fd', icon: '🎣' },
    sold: { label: 'Sold', color: '#6a1b9a', bg: '#f3e5f5', icon: '💰' },
    default: { label: 'Unknown', color: '#9e9e9e', bg: '#fafafa', icon: '❓' },
  };

  // Safely handle non-string status values
  const safeStatus = (typeof status === 'string' ? status : String(status || '')).toLowerCase();
  return configs[safeStatus] || configs.default;
}

// ============================================================================
// Sub-components
// ============================================================================

function DetailRow({ icon, label, value, highlight = false }) {
  if (!value && value !== 0) return null;

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ py: 1 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          bgcolor: highlight ? 'primary.light' : '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: highlight ? 'primary.main' : 'text.secondary',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: highlight ? 600 : 400 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * FishDetailDialog - Dialog for viewing fish details
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onEdit - Edit callback
 * @param {Object} props.fish - Fish data to display
 */
export default function FishDetailDialog({
  open,
  onClose,
  onEdit,
  fish,
}) {
  if (!fish) return null;

  const statusConfig = getFishStatusConfig(fish.status);
  const commonName = fish.common_name || fish.name || 'Unknown Fish';
  const ponds = Array.isArray(fish.ponds) ? fish.ponds.join(', ') : (fish.ponds || '-');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: statusConfig.bg,
                color: statusConfig.color,
                width: 48,
                height: 48,
              }}
            >
              <SetMealIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {commonName}
              </Typography>
              {fish.scientific_name && (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  {fish.scientific_name}
                </Typography>
              )}
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip
              label={statusConfig.label}
              size="small"
              sx={{
                bgcolor: statusConfig.bg,
                color: statusConfig.color,
                fontWeight: 600,
              }}
            />
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DetailRow
              icon={<CategoryIcon fontSize="small" />}
              label="Fish ID"
              value={fish.id || fish._id}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailRow
              icon={<SetMealIcon fontSize="small" />}
              label="Count"
              value={fish.count || fish.total_count || 0}
              highlight
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailRow
              icon={<ScaleIcon fontSize="small" />}
              label="Average Weight"
              value={`${fish.average_weight || fish.avg_weight || '-'} g`}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailRow
              icon={<ScaleIcon fontSize="small" />}
              label="Total Weight"
              value={fish.total_weight ? `${(fish.total_weight / 1000).toFixed(2)} kg` : '-'}
            />
          </Grid>
          <Grid item xs={12}>
            <DetailRow
              icon={<PoolIcon fontSize="small" />}
              label="Ponds"
              value={ponds}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailRow
              icon={<CalendarTodayIcon fontSize="small" />}
              label="Capture Date"
              value={fish.capture_date ? formatDate(fish.capture_date) : '-'}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailRow
              icon={<CalendarTodayIcon fontSize="small" />}
              label="Last Updated"
              value={fish.updated_at ? formatDate(fish.updated_at) : '-'}
            />
          </Grid>

          {/* Custom fields section */}
          {fish.custom_fields && Object.keys(fish.custom_fields).length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Additional Information
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(fish.custom_fields).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Box sx={{ py: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Typography>
                      <Typography variant="body2">{value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Notes section */}
          {fish.notes && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {fish.notes}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {onEdit && (
          <Button
            onClick={() => onEdit(fish)}
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

