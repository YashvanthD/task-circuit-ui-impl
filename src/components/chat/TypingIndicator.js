/**
 * TypingIndicator Component
 * Shows "User is typing..." animation.
 *
 * @module components/chat/TypingIndicator
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
`;

function TypingDot({ delay }) {
  return (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        bgcolor: 'text.secondary',
        animation: `${bounce} 1.4s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export default function TypingIndicator({ users = [], compact = false }) {
  if (users.length === 0) return null;

  const displayText = users.length === 1
    ? `${users[0]} is typing`
    : users.length === 2
    ? `${users[0]} and ${users[1]} are typing`
    : `${users[0]} and ${users.length - 1} others are typing`;

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TypingDot delay={0} />
        <TypingDot delay={0.2} />
        <TypingDot delay={0.4} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1,
        px: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TypingDot delay={0} />
        <TypingDot delay={0.2} />
        <TypingDot delay={0.4} />
      </Box>
      <Typography variant="caption" color="text.secondary">
        {displayText}
      </Typography>
    </Box>
  );
}

