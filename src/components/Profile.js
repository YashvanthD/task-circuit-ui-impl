import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, IconButton, Button, Stack,
  Divider, TextField, FormControlLabel, Switch, CircularProgress, Snackbar, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  getCurrentUser,
  updateNotificationSettings,
  uploadProfilePicture,
  updateProfileDescription
} from '../utils/user';
import { UpdateMobileForm, UpdateMailForm, UpdatePasswordForm, UpdateUsernameForm } from './users/forms';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeMode } from '../contexts/ThemeContext';

export default function Profile() {
  // Theme from context
  const { mode: themeMode, setMode: setThemeMode, isDarkMode } = useThemeMode();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState('');
  const [desc, setDesc] = useState('');
  const [editDesc, setEditDesc] = useState(false);
  const [savingDesc, setSavingDesc] = useState(false);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [mailDialogOpen, setMailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

  // Notification settings state
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifPush, setNotifPush] = useState(false);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifSms, setNotifSms] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  // Snackbar for feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadUser = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Get user data - force API call if refreshing
      const userData = await getCurrentUser(forceRefresh);

      console.log('[Profile] User data loaded:', userData);

      if (userData && (userData.user_key || userData.userKey || userData.username || userData.email)) {
        setUser(userData);
        setProfilePic(userData.avatar_url || userData.profile_photo || '');
        setDesc(userData.description || '');

        // Load notification settings
        const notifSettings = userData.settings?.notifications || {};
        setNotifEnabled(!!notifSettings.enabled);
        setNotifPush(!!notifSettings.push);
        setNotifEmail(!!notifSettings.email);
        setNotifSms(!!notifSettings.sms);
      } else {
        console.warn('[Profile] No user data found');
        showSnackbar('Unable to load profile data', 'warning');
      }
    } catch (e) {
      console.error('[Profile] Failed to load user:', e);
      showSnackbar('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);


  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePic(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to server
    setUploadingPic(true);
    try {
      const result = await uploadProfilePicture(file);
      showSnackbar('Profile picture updated!');
      // Update with server URL if provided
      if (result?.data?.avatar_url) {
        setProfilePic(result.data.avatar_url);
      }
    } catch (err) {
      showSnackbar('Failed to upload picture', 'error');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSaveDescription = async () => {
    setSavingDesc(true);
    try {
      await updateProfileDescription(desc);
      setEditDesc(false);
      showSnackbar('Description updated!');
    } catch (err) {
      showSnackbar('Failed to update description', 'error');
    } finally {
      setSavingDesc(false);
    }
  };

  const handleNotificationToggle = async (field, value) => {
    // Update local state immediately for responsiveness
    if (field === 'enabled') setNotifEnabled(value);
    else if (field === 'push') setNotifPush(value);
    else if (field === 'email') setNotifEmail(value);
    else if (field === 'sms') setNotifSms(value);

    setSavingNotif(true);
    try {
      const newSettings = {
        enabled: field === 'enabled' ? value : notifEnabled,
        push: field === 'push' ? value : notifPush,
        email: field === 'email' ? value : notifEmail,
        sms: field === 'sms' ? value : notifSms,
      };
      await updateNotificationSettings(newSettings);
      showSnackbar('Notification settings updated!');
    } catch (err) {
      // Revert on error
      if (field === 'enabled') setNotifEnabled(!value);
      else if (field === 'push') setNotifPush(!value);
      else if (field === 'email') setNotifEmail(!value);
      else if (field === 'sms') setNotifSms(!value);
      showSnackbar('Failed to update notification settings', 'error');
    } finally {
      setSavingNotif(false);
    }
  };

  const handleFormSuccess = () => {
    // Reload user data after successful update - force fresh API call
    loadUser(true);
  };

  // Get display name properly
  const displayName = user?.display_name || user?.name || user?.username || 'User';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, m: '40px auto', p: 2, bgcolor: 'background.default', boxShadow: 2 }}>
      <CardContent>
        <Stack alignItems="center" spacing={2}>
          {/* Profile Picture */}
          <Box sx={{ position: 'relative' }}>
            <Avatar src={profilePic} sx={{ width: 80, height: 80 }}>
              {displayName[0]?.toUpperCase()}
            </Avatar>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              component="label"
              size="small"
              disabled={uploadingPic}
            >
              {uploadingPic ? <CircularProgress size={16} /> : <PhotoCamera fontSize="small" />}
              <input type="file" accept="image/*" hidden onChange={handlePicChange} />
            </IconButton>
          </Box>

          {/* Username */}
          <Typography variant="h5" fontWeight={700}>{displayName}</Typography>

          {/* Mobile and Email */}
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
            <Box sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {user?.mobile || 'Mobile not added'}
              </Typography>
              <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => setMobileDialogOpen(true)}>
                Update Mobile
              </Button>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Box sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'Email not added'}
              </Typography>
              <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => setMailDialogOpen(true)}>
                Update Email
              </Button>
            </Box>
          </Stack>

          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Description */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
            {editDesc ? (
              <Box>
                <TextField
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  sx={{ mb: 1 }}
                  disabled={savingDesc}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setEditDesc(false);
                      setDesc(user?.description || '');
                    }}
                    disabled={savingDesc}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={savingDesc ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSaveDescription}
                    disabled={savingDesc}
                  >
                    Save
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ flex: 1 }}>{desc || 'No description added.'}</Typography>
                <IconButton size="small" onClick={() => setEditDesc(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Account Keys */}
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
              Account Key: <strong>{user?.account_key || 'N/A'}</strong>
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
              User Key: <strong>{user?.user_key || 'N/A'}</strong>
            </Typography>
          </Stack>

          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Date Info */}
          <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Date of Join: <strong>{user?.joined_date ? new Date(user.joined_date * 1000).toLocaleDateString() : (user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A')}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Login: <strong>{user?.last_active ? new Date(user.last_active * 1000).toLocaleString() : (user?.last_login ? new Date(user.last_login).toLocaleString() : 'N/A')}</strong>
            </Typography>
          </Stack>

          <Divider sx={{ my: 2, width: '100%' }} />

          {/* User Activity Section */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>User Activity</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                <Box sx={{ bgcolor: 'background.paper', color: 'primary.main', p: 2, boxShadow: 4, textAlign: 'center', flex: 1, borderRadius: 1 }}>
                  <Typography variant="body2">Total Tasks</Typography>
                  <Typography variant="h5" fontWeight={700}>{user?.activity?.total || user?.stats?.total_tasks || 0}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'background.paper', color: 'success.main', p: 2, boxShadow: 4, textAlign: 'center', flex: 1, borderRadius: 1 }}>
                  <Typography variant="body2">Completed</Typography>
                  <Typography variant="h5" fontWeight={700}>{user?.activity?.completed || user?.stats?.completed_tasks || 0}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                <Box sx={{ bgcolor: 'background.paper', color: 'warning.main', p: 2, boxShadow: 4, textAlign: 'center', flex: 1, borderRadius: 1 }}>
                  <Typography variant="body2">Pending</Typography>
                  <Typography variant="h5" fontWeight={700}>{user?.activity?.pending || user?.stats?.pending_tasks || 0}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'background.paper', color: 'info.main', p: 2, boxShadow: 4, textAlign: 'center', flex: 1, borderRadius: 1 }}>
                  <Typography variant="body2">Success Rate</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {user?.activity?.successRate ? `${user.activity.successRate}%` :
                     (user?.stats?.success_rate ? `${user.stats.success_rate}%` : '0%')}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Account Settings Section */}
          <Card sx={{ width: '100%', boxShadow: 2, bgcolor: 'background.paper', mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Account Settings</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    fontWeight: 400,
                    boxShadow: 2,
                    p: 1.5,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    textTransform: 'none',
                    fontSize: 16,
                    justifyContent: 'flex-start',
                    '&:hover': { bgcolor: 'primary.light' },
                  }}
                  startIcon={<EditIcon />}
                  onClick={() => setUsernameDialogOpen(true)}
                >
                  Edit Username
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    fontWeight: 400,
                    boxShadow: 2,
                    p: 1.5,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    textTransform: 'none',
                    fontSize: 16,
                    justifyContent: 'flex-start',
                    '&:hover': { bgcolor: 'primary.light' },
                  }}
                  startIcon={<EditIcon />}
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Edit Password
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Notification Settings Section */}
          <Card sx={{ width: '100%', boxShadow: 2, bgcolor: 'background.paper', mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Notification Settings</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body1">Notifications</Typography>
                  <Switch
                    checked={notifEnabled}
                    onChange={(e) => handleNotificationToggle('enabled', e.target.checked)}
                    disabled={savingNotif}
                  />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifPush}
                        disabled={!notifEnabled || savingNotif}
                        onChange={(e) => handleNotificationToggle('push', e.target.checked)}
                      />
                    }
                    label="Push"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifEmail}
                        disabled={!notifEnabled || savingNotif}
                        onChange={(e) => handleNotificationToggle('email', e.target.checked)}
                      />
                    }
                    label="Email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifSms}
                        disabled={!notifEnabled || savingNotif}
                        onChange={(e) => handleNotificationToggle('sms', e.target.checked)}
                      />
                    }
                    label="SMS"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Theme Section */}
          <Card sx={{ width: '100%', boxShadow: 2, bgcolor: 'background.paper', mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Theme</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <AnimatePresence mode="wait">
                  {isDarkMode ? (
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
                  checked={isDarkMode}
                  onChange={e => setThemeMode(e.target.checked ? 'dark' : 'light')}
                  inputProps={{ 'aria-label': 'theme toggle' }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Dialogs for forms */}
        <Dialog open={mobileDialogOpen} onClose={() => setMobileDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Mobile</DialogTitle>
          <DialogContent>
            <UpdateMobileForm
              onSuccess={handleFormSuccess}
              onClose={() => setMobileDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={mailDialogOpen} onClose={() => setMailDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Email</DialogTitle>
          <DialogContent>
            <UpdateMailForm
              onSuccess={handleFormSuccess}
              onClose={() => setMailDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Password</DialogTitle>
          <DialogContent>
            <UpdatePasswordForm
              onSuccess={handleFormSuccess}
              onClose={() => setPasswordDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={usernameDialogOpen} onClose={() => setUsernameDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Username</DialogTitle>
          <DialogContent>
            <UpdateUsernameForm
              onSuccess={handleFormSuccess}
              onClose={() => setUsernameDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
}
