import React from 'react';
import { Card, CardContent, Typography, Button, Stack, Avatar, Divider, IconButton, Switch, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import UserLayout from '../../layouts/UserLayout';

export default function SettingsPage() {
  // Dummy profile data
  const profile = {
    username: 'user1',
    avatar_url: '',
    email: 'user1@example.com',
    mobile: '1234567890',
    created_at: 1764529179 * 1000,
    last_login: 1764529183 * 1000,
    dob: '1990-01-01',
    address1: '123 Main St',
    address2: 'Apt 4B',
    pincode: '560001',
    timezone: 'Asia/Kolkata',
    account_key: '100472',
    user_key: '134152668',
    roles: ['user'],
    access_type: 'Standard',
    permissions: ['View', 'Edit']
  };
  const metrics = {
    completed: 42,
    successRate: '88%',
    future: 'Coming soon...'
  };
  const permissions = {
    role: profile.roles.join(', '),
    accessType: profile.access_type,
    perms: profile.permissions.join(', ')
  };
  const joinedDate = new Date(profile.created_at).toLocaleDateString();
  const lastLogin = new Date(profile.last_login).toLocaleString();

  return (
    <UserLayout>
      <Stack spacing={3} sx={{ maxWidth: 500, m: '40px auto' }}>
        {/* User Info Card */}
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={2}>
              <Box sx={{ position: 'relative' }}>
                <Avatar sx={{ width: 80, height: 80 }} src={profile.avatar_url} />
                <IconButton sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography variant="h5" fontWeight={700}>{profile.username}</Typography>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
                <Box sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {profile.email}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Box sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {profile.mobile}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1} alignItems="center">
                <Typography variant="body1"><strong>Joined:</strong> {joinedDate}</Typography>
                <Typography variant="body1"><strong>Last Login:</strong> {lastLogin}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
        {/* Activity Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>Your Activity</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">Tasks Completed: <strong>{metrics.completed}</strong></Typography>
            <Typography variant="body1">Success Rate: <strong>{metrics.successRate}</strong></Typography>
            <Typography variant="body2" color="text.secondary">{metrics.future}</Typography>
          </CardContent>
        </Card>
        {/* Address & Details Card */}
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600} gutterBottom>Personal Details</Typography>
              <IconButton size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <Typography variant="body1"><strong>Date of Birth:</strong> {profile.dob}</Typography>
              <Typography variant="body1"><strong>Address 1:</strong> {profile.address1}</Typography>
              <Typography variant="body1"><strong>Address 2:</strong> {profile.address2}</Typography>
              <Typography variant="body1"><strong>Pincode:</strong> {profile.pincode}</Typography>
              <Typography variant="body1"><strong>Timezone:</strong> {profile.timezone}</Typography>
            </Stack>
          </CardContent>
        </Card>
        {/* Permissions Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>Your Permission</Typography>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
                Account Key: <strong>{profile.account_key}</strong>
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
                User Key: <strong>{profile.user_key}</strong>
              </Typography>
            </Stack>
            <Divider sx={{ mt: 2, mb: 2 }} />
            <Typography variant="body1">Role: <strong>{permissions.role}</strong></Typography>
            <Typography variant="body1">Access Type: <strong>{permissions.accessType}</strong></Typography>
            <Typography variant="body1">Permissions: <strong>{permissions.perms}</strong></Typography>
          </CardContent>
        </Card>
        {/* Account Settings Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>Account Settings</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary">Edit Profile</Button>
              <Button variant="outlined" color="primary">Change Password</Button>
            </Stack>
          </CardContent>
        </Card>
        {/* Notifications Card (merged) */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>Notifications</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Typography>Enable Notifications</Typography>
              <Switch checked={true} />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography>Push</Typography>
              <Switch checked={true} />
              <Typography>SMS</Typography>
              <Switch checked={false} />
              <Typography>Email</Typography>
              <Switch checked={true} />
            </Stack>
          </CardContent>
        </Card>
        {/* Logout Card */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              <Button variant="contained" color="error" startIcon={<LogoutIcon />}>Logout</Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </UserLayout>
  );
}
