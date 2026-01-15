/**
 * Reusable UI Components
 * Common components used across multiple pages.
 *
 * @module components/common
 */

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, TextField, InputAdornment, Paper, Typography, CircularProgress,
  Snackbar, Alert, Stack, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// ============================================================================
// ConfirmDialog - Reusable confirmation dialog
// ============================================================================

/**
 * Confirmation dialog component.
 * @param {object} props
 * @param {boolean} props.open - Dialog open state
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Confirmation message
 * @param {function} props.onConfirm - Confirm callback
 * @param {function} props.onCancel - Cancel callback
 * @param {string} props.confirmText - Confirm button text
 * @param {string} props.cancelText - Cancel button text
 * @param {string} props.confirmColor - Confirm button color
 */
export function ConfirmDialog({
  open,
  title = 'Confirm',
  message = 'Are you sure?',
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  loading = false,
}) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColor}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// SearchBox - Reusable search input
// ============================================================================

/**
 * Search input component.
 * @param {object} props
 * @param {string} props.value - Search value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 */
export function SearchBox({
  value,
  onChange,
  placeholder = 'Search...',
  fullWidth = true,
  size = 'small',
  sx = { mb: 3 },
}) {
  return (
    <TextField
      label={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth={fullWidth}
      size={size}
      sx={sx}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
}

// ============================================================================
// LoadingState - Loading indicator
// ============================================================================

/**
 * Loading state component.
 * @param {object} props
 * @param {boolean} props.loading - Loading state
 * @param {React.ReactNode} props.children - Content to show when not loading
 */
export function LoadingState({ loading, children, message = 'Loading...' }) {
  if (loading) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
        <CircularProgress />
        <Typography color="text.secondary">{message}</Typography>
      </Stack>
    );
  }
  return children;
}

// ============================================================================
// ErrorAlert - Error display
// ============================================================================

/**
 * Error alert component.
 * @param {object} props
 * @param {string} props.error - Error message
 * @param {function} props.onRetry - Retry callback
 */
export function ErrorAlert({ error, onRetry, sx = { mb: 2 } }) {
  if (!error) return null;

  return (
    <Paper sx={{ p: 2, backgroundColor: '#ffebee', border: '1px solid #f44336', ...sx }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography color="error">{error}</Typography>
        {onRetry && (
          <Button size="small" onClick={onRetry}>
            Retry
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

// ============================================================================
// EmptyState - Empty list display
// ============================================================================

/**
 * Empty state component.
 * @param {object} props
 * @param {string} props.message - Empty message
 * @param {React.ReactNode} props.action - Optional action button
 */
export function EmptyState({ message = 'No items found', action, icon }) {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      {icon && <div style={{ marginBottom: 16 }}>{icon}</div>}
      <Typography color="text.secondary" sx={{ mb: 2 }}>{message}</Typography>
      {action}
    </Paper>
  );
}

// ============================================================================
// StatusChips - Stats display
// ============================================================================

/**
 * Status chips for displaying counts.
 * @param {object} props
 * @param {object} props.stats - Stats object { label: count }
 */
export function StatusChips({ stats = {} }) {
  const colorMap = {
    total: 'primary',
    completed: 'success',
    'in progress': 'info',
    inprogress: 'info',
    pending: 'default',
    error: 'error',
    warning: 'warning',
  };

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {Object.entries(stats).map(([label, count]) => (
        <Chip
          key={label}
          label={`${label}: ${count}`}
          color={colorMap[label.toLowerCase()] || 'default'}
          size="small"
        />
      ))}
    </Stack>
  );
}

// ============================================================================
// SnackbarAlert - Snackbar notification
// ============================================================================

/**
 * Snackbar alert component.
 * @param {object} props
 * @param {object} props.snack - Snack state { open, message, severity }
 * @param {function} props.onClose - Close handler
 */
export function SnackbarAlert({ snack, onClose }) {
  return (
    <Snackbar
      open={snack.open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={snack.severity} sx={{ width: '100%' }}>
        {snack.message}
      </Alert>
    </Snackbar>
  );
}

// ============================================================================
// PageHeader - Page title and actions
// ============================================================================

/**
 * Page header with title and action buttons.
 * @param {object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Optional subtitle
 * @param {React.ReactNode} props.actions - Action buttons
 */
export function PageHeader({ title, subtitle, actions, sx = { mb: 3 } }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ sm: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={sx}
    >
      <div>
        <Typography variant="h4">{title}</Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </div>
      {actions && <Stack direction="row" spacing={1}>{actions}</Stack>}
    </Stack>
  );
}

// ============================================================================
// FormDialog - Generic form dialog wrapper
// ============================================================================

/**
 * Form dialog wrapper.
 * @param {object} props
 * @param {boolean} props.open - Dialog open state
 * @param {function} props.onClose - Close handler
 * @param {string} props.title - Dialog title
 * @param {React.ReactNode} props.children - Form content
 * @param {function} props.onSubmit - Submit handler
 * @param {string} props.submitText - Submit button text
 * @param {boolean} props.loading - Loading state
 */
export function FormDialog({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Save',
  loading = false,
  maxWidth = 'sm',
  fullWidth = true,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <form onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers>{children}</DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : submitText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ============================================================================
// Export new reusable components
// ============================================================================

// Styles
export * from './styles';

// UI Components - New modular components
export { default as FilterSelect } from './FilterSelect';
export { default as SearchInput } from './SearchInput';
export { default as DateRangeFilter } from './DateRangeFilter';
export { default as StatusChipNew } from './StatusChip';
export { default as BaseCard } from './BaseCard';
export { default as StatCard } from './StatCard';
export { default as ActionButton } from './ActionButton';
export { default as EmptyStateNew } from './EmptyState';
export { default as LoadingStateNew } from './LoadingState';
export { default as ErrorState } from './ErrorState';
export { default as PageHeaderNew } from './PageHeader';
export { default as FilterBar } from './FilterBar';
export { default as StatsGrid } from './StatsGrid';
export { default as DataGrid } from './DataGrid';
