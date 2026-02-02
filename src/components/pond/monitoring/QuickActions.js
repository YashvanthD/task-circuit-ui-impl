/**
 * QuickActions - Quick action button bar
 */
import React from 'react';
import { Box, Stack } from '@mui/material';
import { ActionButton } from '../../common';

export default function QuickActions({
  actions = [],
  layout = 'horizontal', // horizontal|vertical|grid
  compact = false,
}) {
  if (!actions || actions.length === 0) return null;

  return (
    <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
      <Stack
        direction={layout === 'horizontal' ? 'row' : 'column'}
        spacing={1}
        justifyContent="space-around"
      >
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
            disabled={action.disabled}
            size={compact ? 'small' : 'medium'}
            color={action.color || 'primary'}
            variant="text"
            sx={{ flex: 1, py: 1 }}
          >
             {action.label}
          </ActionButton>
        ))}
      </Stack>
    </Box>
  );
}
