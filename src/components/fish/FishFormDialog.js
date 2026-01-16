/**
 * FishFormDialog Component
 * Dialog wrapper for fish form with add/edit modes.
 *
 * @module components/fish/FishFormDialog
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SetMealIcon from '@mui/icons-material/SetMeal';

import FishForm from './forms/FishForm';

// ============================================================================
// Main Component
// ============================================================================

/**
 * FishFormDialog - Dialog for adding/editing fish
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onSubmit - Submit callback
 * @param {Object} props.initialData - Initial form data (for edit mode)
 * @param {string} props.mode - 'add' or 'edit'
 * @param {Array} props.pondOptions - Available pond options
 */
export default function FishFormDialog({
  open,
  onClose,
  onSubmit,
  initialData = {},
  mode = 'add',
  pondOptions = [],
}) {
  const isEdit = mode === 'edit';

  const handleSubmit = (data) => {
    if (onSubmit) {
      onSubmit(data);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <SetMealIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {isEdit ? 'Edit Fish' : 'Add New Fish'}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <FishForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          pondOptions={pondOptions}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
}

