import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { getUserAnalytics } from '../../utils/expenses';
import { useParams } from 'react-router-dom';
import { loadUserFromLocalStorage } from '../../utils/auth/storage';
import { is_admin } from '../../utils/auth/permissions';

function loadProfile(id) {
  try {
    const raw = localStorage.getItem(`user_profile_${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function saveProfile(id, data) {
  try { localStorage.setItem(`user_profile_${id}`, JSON.stringify(data)); } catch (e) {}
}

export default function TreeUserView() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: '', title: '' });

  useEffect(() => {
    if (!id) return;
    const p = loadProfile(id);
    if (p) {
      setProfile(p);
      setForm({ name: p.name || '', title: p.title || '' });
    } else {
      // fallback: use analytics map to display name placeholder
      setProfile({ name: id, title: '' });
      setForm({ name: id, title: '' });
    }
    setAnalytics(getUserAnalytics(id));
  }, [id]);

  const currentUser = loadUserFromLocalStorage();
  const canEdit = is_admin(currentUser) || (currentUser && ((currentUser.user && currentUser.user.id) || currentUser.id) === id);

  const openEdit = () => setEditOpen(true);
  const closeEdit = () => setEditOpen(false);
  const saveEdit = () => {
    const updated = { ...(profile || {}), ...form };
    saveProfile(id, updated);
    setProfile(updated);
    setEditOpen(false);
  };

  if (!id) return <Paper sx={{ p: 4 }}><Typography>No user specified</Typography></Paper>;

  return (
    <Paper sx={{ p: 4, maxWidth: 900, margin: '24px auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">User Profile</Typography>
        {canEdit && <Button variant="outlined" onClick={openEdit}>Edit</Button>}
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2">Name</Typography>
        <Typography variant="body1">{profile?.name || id}</Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2">Analytics</Typography>
        {analytics ? (
          <>
            <Typography>Total spent: ₹{analytics.totalSpent}</Typography>
            <Typography>Tasks: {analytics.tasks}</Typography>
            <Typography>Last active: {analytics.lastActive}</Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">No analytics available</Typography>
        )}
      </Box>

      <Dialog open={editOpen} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            <TextField label="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
