import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, IconButton, Button, Stack, Divider, TextField, Radio, FormControlLabel, FormGroup, Switch } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { getCurrentUser } from '../utils/user';
import UpdateMobileForm from '../forms/UpdateMobileForm';
import UpdateMailForm from '../forms/UpdateMailForm';
import UpdatePasswordForm from '../forms/UpdatePasswordForm';
import UpdateUsernameForm from '../forms/UpdateUsernameForm';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile({ onThemeChange }) {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState('');
  const [desc, setDesc] = useState('');
  const [editDesc, setEditDesc] = useState(false);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [mailDialogOpen, setMailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser(); // cached + API fallback
      if (u) {
        setUser(u);
        setProfilePic(u.avatar_url || '');
        setDesc(u.description || '');
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    if (onThemeChange) onThemeChange(themeMode);
  }, [themeMode, onThemeChange]);

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, m: '40px auto', p: 2, bgcolor: '#f5f5f5', boxShadow: 2 }}>
      <CardContent>
        <Stack alignItems="center" spacing={2}>
          <Box sx={{ position: 'relative' }}>
            <Avatar src={profilePic} sx={{ width: 80, height: 80 }} />
            <IconButton
              sx={{ position: 'absolute', bottom: 0, right: 0 }}
              component="label"
              size="small"
            >
              <PhotoCamera fontSize="small" />
              <input type="file" accept="image/*" hidden onChange={handlePicChange} />
            </IconButton>
          </Box>
          <Typography variant="h5" fontWeight={700}>{user?.username || 'User'}</Typography>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
            <Box sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {user?.mobile || 'Mobile not added'}
              </Typography>
              <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => setMobileDialogOpen(true)}>Update Mobile</Button>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Box sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'Email not added'}
              </Typography>
              <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => setMailDialogOpen(true)}>Update Email</Button>
            </Box>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
            {editDesc ? (
              <TextField
                value={desc}
                onChange={e => setDesc(e.target.value)}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                sx={{ mb: 1 }}
                onBlur={() => setEditDesc(false)}
                autoFocus
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ flex: 1 }}>{desc || 'No description added.'}</Typography>
                <IconButton size="small" onClick={() => setEditDesc(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
              Account Key: <strong>{user?.account_key || 'N/A'}</strong>
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
              User Key: <strong>{user?.user_key || 'N/A'}</strong>
            </Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Date of Join: <strong>{user?.joined_date ? new Date(user.joined_date * 1000).toLocaleDateString() : 'N/A'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Login: <strong>{user?.last_active ? new Date(user.last_active * 1000).toLocaleString() : 'N/A'}</strong>
            </Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          {/* User Activity Section - two rows, grid layout */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>User Activity</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                <Box sx={{ bgcolor: 'common.white', color: 'primary.main', p: 2, boxShadow: 4, textAlign: 'center', flex: 1 }}>
                  <Typography variant="body2">Total Tasks</Typography>
                  <Typography variant="h5" fontWeight={700}>{user?.activity?.total || 0}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'common.white', color: 'success.main', p: 2, boxShadow: 4, textAlign: 'center', flex: 1 }}>
                  <Typography variant="body2">Completed</Typography>
                  <Typography variant="h5" fontWeight={700}>{user?.activity?.completed || 0}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                <Box sx={{ bgcolor: 'common.white', color: 'warning.main', p: 2, boxShadow: 4, textAlign: 'center', flex: 1 }}>
                  <Typography variant="body2">Pending</Typography>
                  <Typography variant="h5" fontWeight={700}>{user?.activity?.pending || 0}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'common.white', color: 'info.main', p: 2, boxShadow: 4, textAlign: 'center', flex: 1 }}>
                  <Typography variant="body2">Success Rate</Typography>
                  <Typography variant="h5" fontWeight={700}>{user?.activity?.successRate ? `${user.activity.successRate}%` : '0%'}</Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>
          <Divider sx={{ my: 2 }} />
          {/* Account Settings Section in its own Card */}
          <Card sx={{ width: '100%', boxShadow: 2, bgcolor: 'common.white', mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Account Settings</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    fontWeight: 400,
                    boxShadow: 2,
                    p: 1,
                    bgcolor: 'common.white',
                    color: 'black',
                    textTransform: 'none',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'black',
                    },
                  }}
                  startIcon={<EditIcon />}
                  onClick={() => setUsernameDialogOpen(true)}
                >
                  Edit Username
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    fontWeight: 400,
                    boxShadow: 2,
                    p: 1,
                    bgcolor: 'common.white',
                    color: 'black',
                    textTransform: 'none',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'black',
                    },
                  }}
                  startIcon={<EditIcon />}
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Edit Password
                </Button>
              </Stack>
            </CardContent>
          </Card>
          <Divider sx={{ my: 2 }} />
          {/* Notification Settings Section in its own Card */}
          <Card sx={{ width: '100%', boxShadow: 2, bgcolor: 'common.white', mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Notification Settings</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="body1">Notifications</Typography>
                  <Switch checked={!!user?.settings?.notifications?.enabled} />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <FormControlLabel
                    control={<Switch checked={!!user?.settings?.notifications?.push} disabled={!user?.settings?.notifications?.enabled} />}
                    label="Push Notification"
                  />
                  <FormControlLabel
                    control={<Switch checked={!!user?.settings?.notifications?.email} disabled={!user?.settings?.notifications?.enabled} />}
                    label="Email"
                  />
                  <FormControlLabel
                    control={<Switch checked={!!user?.settings?.notifications?.sms} disabled={!user?.settings?.notifications?.enabled} />}
                    label="Phone"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
          {/* Theme Section in its own Card with icons and animation */}
          <Card sx={{ width: '100%', boxShadow: 2, bgcolor: 'common.white', mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Theme</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" alignItems="center" spacing={2}>
                <AnimatePresence mode="wait">
                  {themeMode === 'dark' ? (
                    <motion.span
                      key="dark"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Brightness4Icon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                      <Typography variant="body1">Dark Mode</Typography>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="light"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Brightness7Icon color="warning" sx={{ fontSize: 32, mr: 1 }} />
                      <Typography variant="body1">Light Mode</Typography>
                    </motion.span>
                  )}
                </AnimatePresence>
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={e => setThemeMode(e.target.checked ? 'dark' : 'light')}
                  inputProps={{ 'aria-label': 'theme toggle' }}
                  sx={{
                    '& .MuiSwitch-thumb': {
                      transition: 'background 0.3s',
                      bgcolor: themeMode === 'dark' ? 'primary.main' : 'warning.main',
                    },
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
        {/* Dialogs for forms */}
        <Dialog open={mobileDialogOpen} onClose={() => setMobileDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Mobile</DialogTitle>
          <DialogContent>
            <UpdateMobileForm />
          </DialogContent>
        </Dialog>
        <Dialog open={mailDialogOpen} onClose={() => setMailDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Email</DialogTitle>
          <DialogContent>
            <UpdateMailForm />
          </DialogContent>
        </Dialog>
        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Password</DialogTitle>
          <DialogContent>
            <UpdatePasswordForm />
          </DialogContent>
        </Dialog>
        <Dialog open={usernameDialogOpen} onClose={() => setUsernameDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Username</DialogTitle>
          <DialogContent>
            <UpdateUsernameForm />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
