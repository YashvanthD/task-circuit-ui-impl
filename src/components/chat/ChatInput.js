/**
 * ChatInput Component
 * Message input with typing indicator support.
 *
 * @module components/chat/ChatInput
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Paper,
  Typography,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// ============================================================================
// Component
// ============================================================================

export default function ChatInput({
  onSend,
  onTypingStart,
  onTypingStop,
  replyTo = null,
  onCancelReply,
  disabled = false,
  placeholder = 'Type a message...',
}) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Focus input on mount and when reply changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [replyTo]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop?.();
    }, 2000);
  }, [isTyping, onTypingStart, onTypingStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        onTypingStop?.();
      }
    };
  }, [isTyping, onTypingStop]);

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTyping();
    }
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed, replyTo?.message_id || null);
    setMessage('');

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    onTypingStop?.();

    // Clear reply
    onCancelReply?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Reply preview */}
      {replyTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            bgcolor: 'action.hover',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="primary" fontWeight={500}>
              Replying to {replyTo.sender_name || 'message'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {replyTo.content}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onCancelReply}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Input area */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          p: 1.5,
        }}
      >
        {/* Attachment button */}
        <Tooltip title="Attach file">
          <IconButton size="small" disabled={disabled}>
            <AttachIcon />
          </IconButton>
        </Tooltip>

        {/* Emoji button */}
        <Tooltip title="Emoji">
          <IconButton size="small" disabled={disabled}>
            <EmojiIcon />
          </IconButton>
        </Tooltip>

        {/* Text input */}
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'grey.50',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'primary.light',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />

        {/* Send button */}
        <Tooltip title="Send (Enter)">
          <span>
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  bgcolor: 'grey.200',
                  color: 'grey.400',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}

