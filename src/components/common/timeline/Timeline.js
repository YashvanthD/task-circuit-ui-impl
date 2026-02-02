/**
 * Timeline - Wrapper component for MUI Timeline
 */
import React from 'react';
import { Timeline as MuiTimeline, timelineOppositeContentClasses } from '@mui/lab';
import { Box, Typography } from '@mui/material';

export default function Timeline({ children, position = 'right', sx = {} }) {
  return (
    <MuiTimeline
      position={position}
      sx={{
        [`& .${timelineOppositeContentClasses.root}`]: {
          flex: 0.2,
        },
        p: 0,
        m: 0,
        ...sx,
      }}
    >
      {children}
    </MuiTimeline>
  );
}
