import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Avatar, IconButton, Button, Stack, Divider, TextField, Radio, FormControlLabel, FormGroup, Switch } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { getUserInfo } from '../utils/user';

export default function Profile() {
  const user = getUserInfo();
  const [profilePic, setProfilePic] = useState(user?.avatar_url || '');
  const [desc, setDesc] = useState(user?.description || '');
  const [editDesc, setEditDesc] = useState(false);

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
              <Button size="small" variant="outlined" sx={{ mt: 1 }}>Update Mobile</Button>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Box sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'Email not added'}
              </Typography>
              <Button size="small" variant="outlined" sx={{ mt: 1 }}>Update Email</Button>
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
          {/* Account Settings Section - only Edit Username and Edit Password, no margin between buttons */}
          <Box sx={{ width: '100%' }}>
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
              >
                Edit Password
              </Button>
            </Stack>
          </Box>
          <Divider sx={{ my: 2 }} />
          {/* Notification Settings Section - toggle switches, disables when notifications off */}
          <Box sx={{ width: '100%' }}>
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
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
