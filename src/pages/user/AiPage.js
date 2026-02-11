/**
 * AiPage
 * ChatGPT-like assistant interface using common chat components.
 * Supports text, voice input (SpeechRecognition), and file attachments.
 *
 * @module pages/user/AiPage
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  Avatar,
  Stack,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  ClearAll as ClearIcon,
  SmartToy as SmartToyIcon,
  Audiotrack as AudiotrackIcon
} from '@mui/icons-material';

// Common Components
import { PageHeader } from '../../components/common';

// Chat Components
import { MessageList } from '../../components/chat'; // Using MessageList for consistent display
import { getCurrentUserKey, getCurrentUserInfo } from '../../api/chat';
import { aiStore, AI_EVENTS } from '../../utils/ai/store';

// ============================================================================
// AI Helper Functions
// ============================================================================

function mockAssistantResponse(userText, attachments) {
  let reply = `I received: "${userText}"`;
  if (attachments && attachments.length) {
    const types = attachments.map(a => a.type).join(', ');
    reply += `\nAnd ${attachments.length} attachment(s): ${types}`;
  }
  reply += `\n\nThis is a simulated response. In a real implementation, this would connect to your AI backend.`;
  return reply;
}


// ============================================================================
// Styles
// ============================================================================

const AI_PARTICIPANT = {
  user_key: 'ai-assistant',
  name: 'AI Assistant',
  avatar_url: null, // Could add a robot icon url here if available
  is_online: true
};

// ============================================================================
// Component
// ============================================================================

export default function AiPage() {
  const currentUserKey = getCurrentUserKey();
  const currentUser = getCurrentUserInfo();

  // Chat State (Synced with AI Store)
  const [messages, setMessages] = useState([]);

  // Load messages on mount and subscribe
  useEffect(() => {
    // Transform store messages to format required by MessageList
    const mapMessages = (msgs) => msgs.map(m => ({
        ...m,
        // Ensure sender_key is set correctly for differentiation
        sender_key: m.role === 'assistant' ? 'ai-assistant' : currentUserKey,
        // Ensure we have a valid timestamp if missing
        created_at: m.created_at || new Date().toISOString()
    }));

    const updateHandler = (msgs) => {
        setMessages(mapMessages(msgs));
    };

    // No-op handlers to satisfy listener requirement if we needed to listen to these events separately
    // But since we rely on UPDATED, we actually don't need to listen to MESSAGE_ADDED or CLEARED here
    // unless UPDATED is not emitted for those.
    // Checking store.js implementation:
    // MESSAGE_ADDED emits message, then UPDATED.
    // CLEARED emits cleared, then UPDATED.
    // So UPDATED covers everything. We can remove the extra listeners.

    aiStore.on(AI_EVENTS.UPDATED, updateHandler);

    // Initial load
    updateHandler(aiStore.getMessages());

    return () => {
        aiStore.off(AI_EVENTS.UPDATED, updateHandler);
    };
  }, [currentUserKey]);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState([]); // {id, file, url, type}

  // Refs
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const committedRef = useRef('');

  // Participants list for MessageList to resolve names
  const participants = [
    { ...currentUser, user_key: currentUserKey },
    AI_PARTICIPANT
  ];

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) finalTranscript += res[0].transcript;
        else interim += res[0].transcript;
      }

      const base = committedRef.current || '';
      const candidate = (base || '') + (finalTranscript || interim || '');
      setInput(candidate);

      if (finalTranscript) {
        committedRef.current = (base || '') + finalTranscript;
      }
    };

    rec.onerror = (e) => {
      console.warn('SpeechRecognition error', e);
      setIsRecording(false);
    };

    rec.onend = () => {
      committedRef.current = '';
      setIsRecording(false);
    };

    recognitionRef.current = rec;

    return () => {
      try {
        recognitionRef.current && recognitionRef.current.stop();
      } catch (e) {}
    };
  }, []);

  // Recording Handlers
  const toggleRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) return alert('Speech recognition not supported in this browser.');

    if (isRecording) {
      rec.stop();
    } else {
      committedRef.current = (typeof input === 'string') ? input : '';
      setIsRecording(true);
      rec.start();
    }
  };

  // Attachment Handlers
  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems = files.map(f => {
      const type = f.type.startsWith('image/') ? 'image' : (f.type.startsWith('audio/') ? 'audio' : 'file');
      return { id: Date.now() + Math.random(), file: f, url: URL.createObjectURL(f), type };
    });

    setAttachments(prev => [...prev, ...newItems]);
    e.target.value = null; // Reset input
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const toRemove = prev.find(a => a.id === id);
      if (toRemove && toRemove.url) {
        URL.revokeObjectURL(toRemove.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  // Send Handler
  const handleSend = async () => {
    const text = (input || '').trim();
    if (!text && attachments.length === 0) return;

    // Use AI Store to persist the message
    const attachmentsCopy = attachments.map(a => ({ ...a }));

    // Append attachment info to text if present
    let displayContent = text;
    if (attachmentsCopy.length > 0) {
       displayContent += '\n\n' + attachmentsCopy.map(a => `[Attachment: ${a.file.name}]`).join('\n');
    }

    aiStore.addUserMessage(displayContent, attachmentsCopy);

    setInput('');
    setAttachments([]);

    // AI Response with typing simulation
    setIsSending(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 800));

      const responseText = mockAssistantResponse(text, attachmentsCopy);

      // Store AI response
      aiStore.addAssistantMessage(responseText);

    } catch (err) {
      console.error('AI Error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      aiStore.clear();
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: '0 auto', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <PageHeader
        title="AI Assistant"
        subtitle="Chat with your intelligent assistant | Voice & Attachments supported"
        icon={<SmartToyIcon fontSize="large" color="primary" />}
        actions={
           <Button
             variant="outlined"
             color="inherit"
             startIcon={<ClearIcon />}
             onClick={handleClearChat}
             size="small"
           >
             Clear Chat
           </Button>
        }
      />

      {/* Main Chat Area */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.default',
          borderRadius: 2,
          mb: 2
        }}
      >
        <MessageList
          messages={messages}
          participants={participants}
          currentUserId={currentUserKey}
          typingUsers={isSending ? [AI_PARTICIPANT] : []}
          onReply={() => {}} // Could implement reply logic
          onReaction={() => {}}
        />

        {/* Helper text for attachments if they exist functionality but not visible in MessageList */}
        {/* We rely on the text representation `[Attachment: name]` added in handleSend for now */}
      </Paper>

      {/* Input Area - Custom implementation mimicking ChatInput but with AI features */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <input
          ref={fileInputRef}
          onChange={handleFilesSelected}
          style={{ display: 'none' }}
          type="file"
          accept="image/*,audio/*"
          multiple
        />

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 1, overflowX: 'auto', py: 0.5 }}>
            {attachments.map(att => (
               <Chip
                 key={att.id}
                 label={att.file.name}
                 onDelete={() => removeAttachment(att.id)}
                 avatar={
                   att.type === 'image' ? <Avatar src={att.url} /> :
                   att.type === 'audio' ? <Avatar><AudiotrackIcon /></Avatar> :
                   <Avatar><AttachFileIcon /></Avatar>
                 }
                 variant="outlined"
               />
            ))}
          </Stack>
        )}

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <Tooltip title="Attach File">
            <IconButton onClick={handleAttachClick} size="small" color={attachments.length > 0 ? 'primary' : 'default'}>
              <AttachFileIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={isRecording ? "Stop Recording" : "Voice Input"}>
            <IconButton
              onClick={toggleRecording}
              color={isRecording ? 'error' : 'default'}
              size="small"
              sx={{
                animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' }
                }
              }}
            >
              {isRecording ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>

          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : "Ask me anything..."}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                bgcolor: 'action.hover',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: 'primary.light' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              }
            }}
          />

          <IconButton
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || isSending}
            color="primary"
            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
          >
             {isSending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>


    </Box>
  );
}
