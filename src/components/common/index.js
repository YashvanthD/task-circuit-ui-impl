/**
 * Common UI Components
 * Reusable components used across multiple pages.
 *
 * @module components/common
 */

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, CircularProgress,
} from '@mui/material';

// ============================================================================
// ConfirmDialog - Core utility (keep inline as it's widely used)
// ============================================================================

/**
 * Confirmation dialog component.
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

/**
 * Form dialog wrapper.
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
// MODULAR COMPONENTS - Import from separate files
// ============================================================================

// Styles
export * from './styles';

// Input Components
export { default as FilterSelect } from './FilterSelect';
export { default as SearchInput } from './SearchInput';
export { default as DateRangeFilter } from './DateRangeFilter';

// Display Components
export { default as StatusChip } from './StatusChip';
export { default as BaseCard } from './BaseCard';
export { default as StatCard } from './StatCard';
export { default as ActionButton } from './ActionButton';

// State Components
export { default as EmptyState } from './EmptyState';
export { default as LoadingState } from './LoadingState';
export { default as ErrorState } from './ErrorState';

// Layout Components
export { default as PageHeader } from './PageHeader';
export { default as FilterBar } from './FilterBar';
export { default as StatsGrid } from './StatsGrid';
export { default as DataGrid } from './DataGrid';

// Alert Components
export { default as AlertPopup, useAlert, getApiErrorMessage, getApiErrorTitle } from './AlertPopup';

// Forms
export * from './forms';

