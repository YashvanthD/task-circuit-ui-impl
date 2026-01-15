/**
 * EmptyState Component
 * Reusable empty state display.
 *
 * @module components/common/EmptyState
 */

import React from 'react';
import { Stack, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

/**
 * EmptyState - Reusable empty state display
 *
 * @param {Object} props
 * @param {string} props.icon - Emoji icon to display
 * @param {React.ReactNode} props.iconComponent - Icon component to display
 * @param {string} props.title - Title text
 * @param {string} props.message - Message text
 * @param {string} props.actionLabel - Action button label
 * @param {Function} props.onAction - Action button handler
 * @param {number} props.py - Vertical padding
 */
export default function EmptyState({
  icon,
  iconComponent,
  title = 'No items found',
  message,
  actionLabel,
  onAction,
  py = 4,
}) {
  return (
    <Stack alignItems="center" sx={{ py }}>
      {iconComponent || (
        icon ? (
          <Typography variant="h4" sx={{ mb: 1 }}>
            {icon}
          </Typography>
        ) : (
          <InboxIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        )
      )}

      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>

      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {message}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}

