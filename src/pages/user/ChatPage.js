/**
 * ChatPage
 * Full-featured chat page with conversations and messages.
 *
 * @module pages/user/ChatPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, useMediaQuery, useTheme, Drawer } from '@mui/material';
import {
  ConversationList,
  ChatWindow,
} from '../../components/chat';
import {
  getConversations,
  getConversationsSync,
  isConversationsLoading,
  getConversationsError,
  getTotalUnreadCount,
  onConversationsChange,
  subscribeToChatWebSocket,
} from '../../utils/cache/chatCache';
import { getCurrentUserKey } from '../../api/chat';

// ============================================================================
// Component
// ============================================================================

export default function ChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get current user key
  const currentUserId = getCurrentUserKey();

  // State
  const [conversations, setConversations] = useState(getConversationsSync);
  const [loading, setLoading] = useState(isConversationsLoading);
  const [error, setError] = useState(getConversationsError);
  const [totalUnread, setTotalUnread] = useState(getTotalUnreadCount);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(true);

  // Subscribe to cache changes
  useEffect(() => {
    const unsubUpdated = onConversationsChange('updated', (data) => {
      setConversations([...data]);
      setTotalUnread(getTotalUnreadCount());
    });
    const unsubLoading = onConversationsChange('loading', (val) => setLoading(val));
    const unsubError = onConversationsChange('error', (err) => setError(err));

    // Subscribe to WebSocket events
    subscribeToChatWebSocket();

    // Load conversations
    getConversations();

    return () => {
      unsubUpdated();
      unsubLoading();
      unsubError();
    };
  }, []);

  // Handlers
  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  }, [isMobile]);

  const handleBack = useCallback(() => {
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  }, [isMobile]);

  const handleNewChat = useCallback(() => {
    // TODO: Implement new chat dialog
    console.log('New chat clicked');
  }, []);

  // Conversation list component
  const conversationListComponent = (
    <ConversationList
      conversations={conversations}
      selectedId={selectedConversation?.conversation_id}
      loading={loading}
      error={error}
      totalUnread={totalUnread}
      currentUserId={currentUserId}
      onSelect={handleSelectConversation}
      onNewChat={handleNewChat}
    />
  );

  // Mobile layout with drawer
  if (isMobile) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '85%',
              maxWidth: 360,
            },
          }}
        >
          {conversationListComponent}
        </Drawer>
        <ChatWindow
          conversation={selectedConversation}
          currentUserId={currentUserId}
          onBack={handleBack}
        />
      </Box>
    );
  }

  // Desktop layout with side-by-side
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      {/* Conversation list */}
      <Box
        sx={{
          width: 360,
          minWidth: 300,
          maxWidth: 400,
          height: '100%',
          flexShrink: 0,
        }}
      >
        {conversationListComponent}
      </Box>

      {/* Chat window */}
      <Box
        sx={{
          flex: 1,
          height: '100%',
          minWidth: 0,
        }}
      >
        <ChatWindow
          conversation={selectedConversation}
          currentUserId={currentUserId}
        />
      </Box>
    </Box>
  );
}

