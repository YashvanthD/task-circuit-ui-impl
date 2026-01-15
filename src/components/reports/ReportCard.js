/**
 * ReportCard Component
 * Displays a single report item.
 *
 * @module components/reports/ReportCard
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
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { formatReportType, formatReportCategory } from '../../utils/helpers/reports';
import { REPORT_CATEGORIES } from '../../constants';

// ============================================================================
// Main Component
// ============================================================================

/**
 * ReportCard - A reusable report display card
 *
 * @param {Object} props
 * @param {Object} props.report - Report object
 * @param {Function} props.onView - View callback
 * @param {Function} props.onDownload - Download callback
 * @param {boolean} props.compact - Compact view mode
 */
export default function ReportCard({
  report,
  onView,
  onDownload,
  compact = false,
}) {
  const categoryColors = {
    [REPORT_CATEGORIES.PRODUCTION]: '#4caf50',
    [REPORT_CATEGORIES.FINANCIAL]: '#2196f3',
    [REPORT_CATEGORIES.INVENTORY]: '#ff9800',
    [REPORT_CATEGORIES.OPERATIONS]: '#9c27b0',
  };

  const categoryColor = categoryColors[report.category] || '#757575';

  if (compact) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${categoryColor}`,
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
            bgcolor: `${categoryColor}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AssessmentIcon sx={{ color: categoryColor }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
            {report.title || formatReportType(report.type)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatReportCategory(report.category)} •{' '}
            {report.date ? new Date(report.date).toLocaleDateString() : 'N/A'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => onView?.(report)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={() => onDownload?.(report)}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${categoryColor}22 0%, ${categoryColor}11 100%)`,
          borderBottom: `3px solid ${categoryColor}`,
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <AssessmentIcon sx={{ color: categoryColor }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {formatReportType(report.type)}
          </Typography>
        </Stack>
        <Chip
          label={formatReportCategory(report.category)}
          size="small"
          sx={{ bgcolor: 'white', color: categoryColor, fontWeight: 600 }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          {report.title || 'Report'}
        </Typography>

        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarTodayIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {report.date ? new Date(report.date).toLocaleDateString() : 'N/A'}
            </Typography>
          </Stack>
        </Stack>

        {report.summary && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {report.summary}
          </Typography>
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Tooltip title="View Report">
            <IconButton size="small" color="primary" onClick={() => onView?.(report)}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={() => onDownload?.(report)}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Paper>
  );
}

