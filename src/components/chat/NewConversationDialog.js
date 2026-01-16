/**
 * NewConversationDialog Component
 * Dialog to select a contact and start a new conversation (WhatsApp style).
 *
 * @module components/chat/NewConversationDialog
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { getUsers, getUsersSync } from '../../utils/cache/usersCache';
import { getCurrentUserKey } from '../../api/chat';

// ============================================================================
// Component
// ============================================================================

export default function NewConversationDialog({
  open,
  onClose,
  onSelectUser,
  onCreateGroup,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentUserKey = getCurrentUserKey();

  // Load users when dialog opens
  useEffect(() => {
    if (open) {
      // Get cached users first
      const cached = getUsersSync();
      if (cached && cached.length > 0) {
        setUsers(cached);
      }

      // Fetch fresh data
      setLoading(true);
      getUsers()
        .then((data) => {
          setUsers(data || []);
        })
        .catch((err) => {
          console.error('Failed to load users:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Reset search when dialog closes
      setSearchQuery('');
    }
  }, [open]);

  // Filter users by search query (exclude current user)
  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      // Exclude current user
      const userKey = user.user_key || user.id;
      if (userKey === currentUserKey) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = (user.name || user.username || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const phone = (user.phone || '').toLowerCase();
        return name.includes(query) || email.includes(query) || phone.includes(query);
      }

      return true;
    });

    // Sort alphabetically by name
    return filtered.sort((a, b) => {
      const nameA = (a.name || a.username || '').toLowerCase();
      const nameB = (b.name || b.username || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [users, searchQuery, currentUserKey]);

  // Group users by first letter
  const groupedUsers = useMemo(() => {
    const groups = {};
    filteredUsers.forEach((user) => {
      const name = user.name || user.username || 'Unknown';
      const firstLetter = name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(user);
    });
    return groups;
  }, [filteredUsers]);

  const handleSelectUser = (user) => {
    onSelectUser?.(user);
    onClose();
  };

  const handleCreateGroup = () => {
    onCreateGroup?.();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: 600,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          New Chat
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Search Bar */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
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

        {/* New Group Option */}
        {onCreateGroup && !searchQuery && (
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <ListItemButton onClick={handleCreateGroup} sx={{ py: 1.5 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <GroupIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="New Group"
                secondary="Create a group chat"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </Box>
        )}

        {/* Contacts List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Loading state */}
          {loading && users.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          )}

          {/* Empty state */}
          {!loading && filteredUsers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
              <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary" variant="body2">
                {searchQuery ? 'No contacts found' : 'No contacts available'}
              </Typography>
            </Box>
          )}

          {/* Contacts grouped by letter */}
          <List disablePadding>
            {Object.keys(groupedUsers)
              .sort()
              .map((letter) => (
                <React.Fragment key={letter}>
                  {/* Letter header */}
                  <ListItem
                    sx={{
                      py: 0.5,
                      px: 2,
                      bgcolor: 'grey.50',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="primary"
                    >
                      {letter}
                    </Typography>
                  </ListItem>

                  {/* Users in this letter group */}
                  {groupedUsers[letter].map((user) => (
                    <ContactItem
                      key={user.user_key || user.id}
                      user={user}
                      onClick={() => handleSelectUser(user)}
                    />
                  ))}
                </React.Fragment>
              ))}
          </List>
        </Box>

        {/* Footer with count */}
        {filteredUsers.length > 0 && (
          <Box
            sx={{
              px: 2,
              py: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {filteredUsers.length} contact{filteredUsers.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Contact Item Sub-component
// ============================================================================

function ContactItem({ user, onClick }) {
  const name = user.name || user.username || 'Unknown';
  const email = user.email || '';
  const avatarUrl = user.avatar_url || user.profile_picture;
  const role = user.role || user.designation;
  const isOnline = user.is_online;

  // Get initials for avatar
  const initials = name
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        py: 1.5,
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <ListItemAvatar>
        <Box sx={{ position: 'relative' }}>
          <Avatar src={avatarUrl} sx={{ bgcolor: 'primary.light' }}>
            {initials || <PersonIcon />}
          </Avatar>
          {isOnline !== undefined && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: isOnline ? 'success.main' : 'grey.400',
                border: '2px solid white',
              }}
            />
          )}
        </Box>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" fontWeight={500}>
              {name}
            </Typography>
            {role && (
              <Chip
                label={role}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        }
        secondary={email}
        secondaryTypographyProps={{
          noWrap: true,
          sx: { maxWidth: 250 },
        }}
      />
    </ListItemButton>
  );
}

