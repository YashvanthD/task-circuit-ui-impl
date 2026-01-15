/**
 * AssistantConversation Component
 * Conversation/chat display for the assistant.
 *
 * @module components/assistant/AssistantConversation
 */

import React from 'react';
import { Paper, Typography, Stack, IconButton, Box, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { Z_INDEX, MESSAGE_PROTECTION_MS } from './constants';

/**
 * MessageBubble - Single message in conversation
 */
function MessageBubble({ message, index, onRemove }) {
  const isUser = message.role === 'user';
  const isProtected = Date.now() - (message.timestamp || 0) < MESSAGE_PROTECTION_MS;

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="flex-start"
      sx={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
      }}
    >
      {!isUser && (
        <SmartToyIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.5 }} />
      )}

      <Box
        sx={{
          bgcolor: isUser ? 'primary.main' : 'grey.100',
          color: isUser ? 'white' : 'text.primary',
          px: 1.5,
          py: 1,
          borderRadius: 2,
          borderTopLeftRadius: isUser ? 2 : 0,
          borderTopRightRadius: isUser ? 0 : 2,
          position: 'relative',
          '&:hover .delete-btn': {
            opacity: 1,
          },
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
          {message.text}
        </Typography>

        {!isProtected && onRemove && (
          <IconButton
            className="delete-btn"
            size="small"
            onClick={() => onRemove(index)}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              padding: 0.25,
              bgcolor: 'background.paper',
              opacity: 0,
              transition: 'opacity 0.2s',
              '&:hover': { bgcolor: 'error.light', color: 'white' },
            }}
          >
            <DeleteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>

      {isUser && (
        <PersonIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.5 }} />
      )}
    </Stack>
  );
}

/**
 * AssistantConversation - Chat history display
 *
 * @param {Object} props
 * @param {boolean} props.visible - Whether conversation is visible
 * @param {Array} props.messages - Array of { role, text, timestamp }
 * @param {Object} props.position - { left, top } position
 * @param {Function} props.onRemoveMessage - Remove message handler
 * @param {Function} props.onClose - Close handler
 */
export default function AssistantConversation({
  visible,
  messages = [],
  position,
  onRemoveMessage,
  onClose,
}) {
  if (!visible || messages.length === 0) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        left: position.left - 100,
        top: position.top + 70,
        zIndex: Z_INDEX.popup,
        p: 2,
        borderRadius: 2,
        maxWidth: 320,
        minWidth: 250,
        maxHeight: 300,
        overflow: 'auto',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Conversation
        </Typography>
        <Chip label={`${messages.length} messages`} size="small" />
      </Stack>

      <Stack spacing={1.5}>
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            index={index}
            onRemove={onRemoveMessage}
          />
        ))}
      </Stack>
    </Paper>
  );
}

