/**
 * ExpenseCard Component
 * Displays a single expense item.
 *
 * @module components/expenses/ExpenseCard
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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { formatCurrency } from '../../utils/helpers/formatters';
import { EXPENSE_CATEGORIES, EXPENSE_STATUS, EXPENSE_CATEGORY_OPTIONS } from '../../constants';

// ============================================================================
// Helpers
// ============================================================================

function getCategoryIcon(category) {
  const opt = EXPENSE_CATEGORY_OPTIONS.find((o) => o.value === category);
  return opt?.icon || '📦';
}

function getStatusConfig(status) {
  const configs = {
    [EXPENSE_STATUS.PENDING]: { color: 'warning', label: 'Pending' },
    [EXPENSE_STATUS.APPROVED]: { color: 'success', label: 'Approved' },
    [EXPENSE_STATUS.REJECTED]: { color: 'error', label: 'Rejected' },
    [EXPENSE_STATUS.PAID]: { color: 'info', label: 'Paid' },
  };
  return configs[status] || configs[EXPENSE_STATUS.PENDING];
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ExpenseCard - A reusable expense display card
 *
 * @param {Object} props
 * @param {Object} props.expense - Expense object
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 * @param {boolean} props.compact - Compact view mode
 */
export default function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  compact = false,
}) {
  const statusConfig = getStatusConfig(expense.status);
  const categoryIcon = getCategoryIcon(expense.category);

  if (compact) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
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
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ fontSize: '1.2rem' }}>{categoryIcon}</Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
            {expense.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
          </Typography>
        </Box>

        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
          {formatCurrency(expense.amount)}
        </Typography>

        <Chip label={statusConfig.label} size="small" color={statusConfig.color} />

        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => onEdit?.(expense)}>
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
          bgcolor: 'grey.100',
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: '1.5rem' }}>{categoryIcon}</Typography>
          <Typography variant="subtitle2" color="text.secondary" textTransform="capitalize">
            {expense.category}
          </Typography>
        </Stack>
        <Chip label={statusConfig.label} size="small" color={statusConfig.color} />
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {expense.title}
        </Typography>

        <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
          {formatCurrency(expense.amount)}
        </Typography>

        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarTodayIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
            </Typography>
          </Stack>
        </Stack>

        {expense.description && (
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
            {expense.description}
          </Typography>
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit?.(expense)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => onDelete?.(expense)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Paper>
  );
}

