import React, { useState } from 'react';
import { Paper, Typography, Card, CardContent, Stack, Avatar, Box, IconButton, Divider, Fade } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const dummyChats = [
  { id: 1, name: 'Alice', message: 'Hey, how are you?', time: '10:01 AM' },
  { id: 2, name: 'Bob', message: 'Did you finish the task?', time: '10:03 AM' },
  { id: 3, name: 'Charlie', message: 'Let’s catch up later!', time: '10:05 AM' },
  { id: 4, name: 'Diana', message: 'Good morning!', time: '10:07 AM' },
];

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(dummyChats[0]);
  const [listCollapsed, setListCollapsed] = useState(false);

  return (
    <Paper sx={{ p: 0, width: '100%', height: '100%', minHeight: 0, minWidth: 0, boxShadow: 3, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
      {/* Chat User List Column */}
      <Fade in={!listCollapsed} timeout={400}>
        <Box
          sx={{
            width: listCollapsed ? 0 : 280,
            minWidth: listCollapsed ? 0 : 220,
            maxWidth: 320,
            bgcolor: 'grey.100',
            borderRight: '1px solid #eee',
            overflowY: 'auto',
            height: '100%',
            transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
            display: listCollapsed ? 'none' : 'block',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
            <Typography variant="h6">Chats</Typography>
            <IconButton size="small" onClick={() => setListCollapsed(true)}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <Divider />
          <Stack spacing={0} sx={{ mt: 1 }}>
            {dummyChats.map(chat => (
              <Card
                key={chat.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: selectedChat.id === chat.id ? 4 : 1,
                  bgcolor: selectedChat.id === chat.id ? 'secondary.light' : 'common.white',
                  cursor: 'pointer',
                  mb: 1,
                  mx: 2,
                  transition: 'box-shadow 0.2s',
                }}
                onClick={() => setSelectedChat(chat)}
              >
                <Avatar sx={{ m: 2 }}>{chat.name[0]}</Avatar>
                <CardContent sx={{ flex: 1, py: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{chat.name}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>{chat.message}</Typography>
                </CardContent>
                <Typography variant="caption" sx={{ m: 2, color: 'grey.500' }}>{chat.time}</Typography>
              </Card>
            ))}
          </Stack>
        </Box>
      </Fade>
      {/* Chat Window Column */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.default',
          position: 'relative',
          minWidth: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #eee', minHeight: 64 }}>
          {listCollapsed && (
            <IconButton size="small" onClick={() => setListCollapsed(false)} sx={{ mr: 2 }}>
              <ChevronRightIcon />
            </IconButton>
          )}
          <Avatar sx={{ mr: 2 }}>{selectedChat.name[0]}</Avatar>
          <Typography variant="h6">{selectedChat.name}</Typography>
          <Typography variant="caption" sx={{ ml: 2, color: 'grey.500' }}>{selectedChat.time}</Typography>
        </Box>
        <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
          {/* Dummy chat messages */}
          <Typography variant="body2" sx={{ mb: 2, color: 'grey.700' }}>
            {selectedChat.message}
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic' }}>
            (This is a dummy chat window. Add chat messages and input here.)
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
