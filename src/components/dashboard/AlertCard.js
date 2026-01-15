/**
 * AlertCard Component
 * Displays a single alert/task card with priority styling.
 *
 * @module components/dashboard/AlertCard
 */

import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { getPriorityStyle } from '../../utils/helpers/tasks';
import { formatTimestamp } from '../../utils/helpers/date';

/**
 * AlertCard - Single alert display card.
 *
 * @param {Object} props
 * @param {Object} props.alert - Alert data
 * @param {Function} props.onClick - Click handler
 */
export default function AlertCard({ alert, onClick }) {
  const priorityStyle = getPriorityStyle(alert.priority);

  return (
    <Card
      sx={{
        cursor: 'pointer',
        ...priorityStyle,
        p: 2,
        m: 2,
        '&:hover': {
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Typography
          variant="body1"
          sx={{
            fontWeight: alert.unread ? 'bold' : 'normal',
            color: alert.unread ? 'error.main' : 'inherit',
          }}
        >
          {alert.title}
          <span
            style={{
              float: 'right',
              fontWeight: 'bold',
              color: '#888',
            }}
          >
            #{alert.priority}
          </span>
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {alert.description}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Complete by: {alert.completeBy ? formatTimestamp(alert.completeBy) : 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  );
}

