/**
 * FormActions Component
 * Reusable form action buttons (Submit, Cancel, etc.)
 *
 * @module components/common/forms/FormActions
 */

import React from 'react';
import { Grid, Box, Button, Divider } from '@mui/material';

/**
 * FormActions - Form action buttons
 *
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {string} props.submitText - Submit button text (default: "Submit")
 * @param {string} props.cancelText - Cancel button text (default: "Cancel")
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.showDivider - Show divider above buttons (default: true)
 */
export default function FormActions({
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  disabled = false,
  showDivider = true,
  children, // Added children prop
}) {
  return (
    <Grid item xs={12}>
      {showDivider && <Divider sx={{ my: 2 }} />}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          alignItems: 'center',
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
          flexDirection: { xs: 'column-reverse', sm: 'row' },
        }}
      >
        {children} {/* Render additional actions (like Delete) first or as specified */}

        <Box sx={{ display: 'flex', gap: 2, flex: { xs: 1, sm: 'none' }, justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 120 } }}
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant="contained"
            type="submit"
            onClick={onSubmit}
            disabled={disabled || loading}
            sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 120 } }}
          >
            {loading ? 'Loading...' : submitText}
          </Button>
        </Box>
      </Box>
    </Grid>
  );
}
