/**
 * NotificationBadge Component
 * Badge showing unread notification count for header/navbar.
 *
 * @module components/notifications/NotificationBadge
 */

import React from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

export default function NotificationBadge({
  count = 0,
  onClick,
  maxCount = 99,
  color = 'error',
  size = 'medium',
}) {
  const displayCount = count > maxCount ? `${maxCount}+` : count;

  return (
    <Tooltip title={count > 0 ? `${count} notifications` : 'Notifications'}>
      <IconButton
        onClick={onClick}
        size={size}
        sx={{
          color: 'inherit',
        }}
      >
        <Badge
          badgeContent={displayCount}
          color={color}
          max={maxCount}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.7rem',
              minWidth: 18,
              height: 18,
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

