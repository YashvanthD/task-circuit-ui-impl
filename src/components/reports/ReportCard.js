/**
 * ReportCard Component
 * Displays a single report item using the common ItemCard.
 *
 * @module components/reports/ReportCard
 */

import React from 'react';
import {
  Typography,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { formatReportType, formatReportCategory } from '../../utils/helpers/reports';
import { REPORT_CATEGORIES } from '../../constants';
import { ItemCard } from '../common';

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

  const icon = <AssessmentIcon sx={{ color: compact ? categoryColor : 'inherit' }} />;

  // Actions
  const actions = (
    <>
      <Tooltip title="View Report">
        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onView?.(report); }}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download">
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDownload?.(report); }}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );

  return (
    <ItemCard
      compact={compact}
      title={report.title || formatReportType(report.type)}
      subtitle={
        compact
          ? `${formatReportCategory(report.category)} • ${report.date ? new Date(report.date).toLocaleDateString() : 'N/A'}`
          : undefined
      }
      icon={icon}
      color={categoryColor}
      status={compact ? null : formatReportCategory(report.category)}
      actions={actions}
      onClick={() => onView?.(report)}
    >
      {!compact && (
        <>
          <Stack spacing={1} sx={{ mt: 1 }}>
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
        </>
      )}
    </ItemCard>
  );
}
