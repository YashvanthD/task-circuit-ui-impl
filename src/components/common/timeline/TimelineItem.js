/**
 * TimelineItem - Single item in the timeline
 */
import React from 'react';
import {
  TimelineItem as MuiTimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { Typography, Box } from '@mui/material';

export default function TimelineItem({
  title,
  description,
  time,
  icon,
  color = 'primary',
  last = false,
  onClick,
}) {
  return (
    <MuiTimelineItem>
      <TimelineOppositeContent color="text.secondary">
        {time}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot color={color} sx={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
          {icon}
        </TimelineDot>
        {!last && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <Typography variant="h6" component="span" sx={{ fontSize: '1rem', fontWeight: 600 }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" variant="body2">
            {description}
          </Typography>
        )}
      </TimelineContent>
    </MuiTimelineItem>
  );
}
