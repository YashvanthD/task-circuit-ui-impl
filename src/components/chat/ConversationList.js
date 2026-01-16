/**
 * ConversationList Component
 * List of conversations with search.
 *
 * @module components/chat/ConversationList
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import ConversationItem from './ConversationItem';
import {
  getConversationDisplayName,
  getConversationAvatar,
  isOtherUserOnline,
} from '../../api/chat';

// ============================================================================
// Component
// ============================================================================

export default function ConversationList({
  conversations = [],
  selectedId = null,
  loading = false,
  error = null,
  totalUnread = 0,
  currentUserId,
  onSelect,
  onNewChat,
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase().trim();
    return conversations.filter((conv) => {
      const name = getConversationDisplayName(conv, currentUserId);
      return name.toLowerCase().includes(query);
    });
  }, [conversations, searchQuery, currentUserId]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={totalUnread} color="primary" max={99}>
            <ChatIcon color="primary" />
          </Badge>
          <Typography variant="h6" fontWeight={600}>
            Messages
          </Typography>
        </Box>
        {onNewChat && (
          <Tooltip title="New conversation">
            <IconButton color="primary" onClick={onNewChat}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'grey.50',
            },
          }}
        />
      </Box>

      {/* Conversation list */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 1,
        }}
      >
        {/* Loading state */}
        {loading && conversations.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <Typography color="error" variant="body2">
              Failed to load conversations
            </Typography>
          </Box>
        )}

        {/* Empty state */}
        {!loading && !error && filteredConversations.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <ChatIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary" variant="body2">
              {searchQuery
                ? 'No conversations found'
                : 'No conversations yet. Start a new chat!'}
            </Typography>
          </Box>
        )}

        {/* Conversations */}
        {filteredConversations.map((conversation) => {
          const displayName = getConversationDisplayName(conversation, currentUserId);
          const avatarUrl = getConversationAvatar(conversation, currentUserId);
          const isOnline = isOtherUserOnline(conversation, currentUserId);

          return (
            <ConversationItem
              key={conversation.conversation_id}
              conversation={conversation}
              displayName={displayName}
              avatarUrl={avatarUrl}
              isOnline={isOnline}
              isSelected={selectedId === conversation.conversation_id}
              onClick={() => onSelect(conversation)}
            />
          );
        })}
      </Box>
    </Box>
  );
}

