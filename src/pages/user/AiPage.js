import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  Avatar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/ClearAll';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';

// ChatGPT-like UI with microphone (Web Speech API) transcription and media attachment support.
// This front-end uses the browser's SpeechRecognition (when available) to transcribe microphone input
// and lets users attach images/audio files. Replace mockAssistantResponse with a real backend call.

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mockAssistantResponse(userText, attachments) {
  // Build a friendly mock reply referencing attached types if present.
  let reply = `You said: "${userText}"`;
  if (attachments && attachments.length) {
    const types = attachments.map(a => a.type).join(', ');
    reply += `\n\n(Received attachments: ${types})`;
  }
  reply += `\n\n[This is a simulated ChatGPT-style response — replace with a real model call]`;
  return reply;
}

export default function AiPage() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Hi — I am your ChatGPT-like assistant. Ask me anything!', ts: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState([]); // {id, file, url, type}
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const committedRef = useRef(''); // store committed text before recording

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending, attachments]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize SpeechRecognition if available
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
      // show interim + final in input (but do not commit final until stop)
      const base = committedRef.current || '';
      const candidate = (base || '') + (finalTranscript || interim || '');
      setInput(candidate);
      // if finalTranscript exists, update committed base so next interim appends after it
      if (finalTranscript) {
        committedRef.current = (base || '') + finalTranscript;
      }
    };

    rec.onerror = (e) => {
      console.warn('SpeechRecognition error', e);
      setIsRecording(false);
    };

    rec.onend = () => {
      // When recognition ends, clear committedRef (keep input as final)
      committedRef.current = '';
      setIsRecording(false);
    };

    recognitionRef.current = rec;

    return () => {
      try {
        recognitionRef.current && recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    };
  }, []);

  const startRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) return alert('Speech recognition not supported in this browser.');
    try {
      // store committed base
      committedRef.current = (typeof input === 'string') ? input : '';
      setIsRecording(true);
      rec.start();
    } catch (e) {
      console.warn('startRecording failed', e);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch (e) {
      // ignore
    }
    // rec.onend will setIsRecording(false)
  };

  const handleAttachClick = (e) => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems = files.map(f => {
      const type = f.type.startsWith('image/') ? 'image' : (f.type.startsWith('audio/') ? 'audio' : 'file');
      return { id: Date.now() + Math.random(), file: f, url: URL.createObjectURL(f), type };
    });
    setAttachments(prev => [...prev, ...newItems]);
    // clear the input so same file can be selected again
    e.target.value = null;
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const toRemove = prev.find(a => a.id === id);
      if (toRemove) {
        try { URL.revokeObjectURL(toRemove.url); } catch (e) {}
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const handleSend = async () => {
    const text = (input || '').trim();
    if (!text && attachments.length === 0) return;

    // copy attachments to message so later clearing attachments state doesn't remove them
    const attachmentsCopy = attachments.map(a => ({ ...a }));
    const userMsg = { id: Date.now() + Math.random(), role: 'user', text, ts: Date.now(), attachments: attachmentsCopy };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);

    // assistant typing
    setIsSending(true);
    const typingId = 'typing-' + Date.now();
    setMessages(prev => [...prev, { id: typingId, role: 'assistant', text: '...', ts: Date.now() }]);

    try {
      // simulate async call
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
      const assistantText = mockAssistantResponse(text, attachmentsCopy);
      setMessages(prev => prev.map(m => (m.id === typingId ? { id: Date.now() + Math.random(), role: 'assistant', text: assistantText, ts: Date.now() } : m)));
    } catch (e) {
      setMessages(prev => prev.map(m => (m.id === typingId ? { id: Date.now() + Math.random(), role: 'assistant', text: 'Sorry, an error occurred.', ts: Date.now() } : m)));
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

  const handleClear = () => {
    // release object URLs
    attachments.forEach(a => { try { URL.revokeObjectURL(a.url); } catch (e) {} });
    setAttachments([]);
    setMessages([{ id: Date.now(), role: 'assistant', text: 'Hi — conversation cleared. Ask me anything!', ts: Date.now() }]);
    setInput('');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1100, margin: '32px auto' }}>
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, mb: 2 }} elevation={2}>
        <SmartToyIcon color="primary" />
        <Typography variant="h5" sx={{ flex: 1 }}>Chat with AI (ChatGPT UI)</Typography>

        <input ref={fileInputRef} onChange={handleFilesSelected} style={{ display: 'none' }} type="file" accept="image/*,audio/*" multiple />

        <Tooltip title={isRecording ? 'Stop recording' : 'Record voice (transcribed)'}>
          <IconButton onClick={() => (isRecording ? stopRecording() : startRecording())} color={isRecording ? 'error' : 'primary'} aria-label="toggle-recording">
            {isRecording ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Attach image or audio">
          <IconButton onClick={handleAttachClick} aria-label="attach-media">
            <AttachFileIcon />
          </IconButton>
        </Tooltip>

        <Button startIcon={<ClearIcon />} onClick={handleClear} size="small" sx={{ ml: 1 }}>Clear</Button>
      </Paper>

      <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column', p: 2 }} elevation={1}>
        <Box sx={{ overflowY: 'auto', flex: 1, pr: 1 }}>
          {messages.map((m) => (
            <Box key={m.id} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-end', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && (
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}><SmartToyIcon /></Avatar>
              )}

              <Box sx={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <Paper sx={{ p: 1.2, bgcolor: m.role === 'user' ? 'primary.main' : 'grey.100', color: m.role === 'user' ? 'common.white' : 'text.primary', borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{m.text}</Typography>

                  {/* attachments preview if any */}
                  {m.attachments && m.attachments.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {m.attachments.map(att => (
                        <Box key={att.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {att.type === 'image' && <img src={att.url} alt={att.file?.name || 'image'} style={{ maxWidth: 240, borderRadius: 6 }} />}
                          {att.type === 'audio' && (
                            <audio controls src={att.url} style={{ maxWidth: 300 }} />
                          )}
                          {att.type === 'file' && <Typography variant="body2">{att.file?.name}</Typography>}
                        </Box>
                      ))}
                    </Box>
                  )}

                </Paper>
                <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>{formatTime(m.ts)}</Typography>
              </Box>

              {m.role === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>{/* user's initial */}</Avatar>
              )}
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            inputRef={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message and press Enter to send (or use the mic)"
            multiline
            minRows={1}
            maxRows={6}
            fullWidth
            variant="outlined"
            aria-label="chat-input"
          />

          {/* show small previews for attachments ready to send */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 1 }}>
            {attachments.map(att => (
              <Box key={att.id} sx={{ display: 'flex', gap: 0.5, alignItems: 'center', bgcolor: 'grey.100', p: 0.5, borderRadius: 1 }}>
                {att.type === 'image' && <ImageIcon fontSize="small" />}
                {att.type === 'audio' && <AudiotrackIcon fontSize="small" />}
                <Typography variant="caption" sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.file?.name}</Typography>
                <IconButton size="small" onClick={() => removeAttachment(att.id)} aria-label="remove-attachment"><ClearIcon fontSize="small" /></IconButton>
              </Box>
            ))}
          </Box>

          <IconButton color="primary" onClick={handleSend} disabled={isSending} aria-label="send">
            {isSending ? <CircularProgress size={22} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>

      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
        Tip: Microphone transcription uses the browser's Speech Recognition API (Google Web Speech where available). Uploaded media are local previews; to transcribe uploaded audio files, integrate a backend transcription service.
      </Typography>
    </Box>
  );
}
