import React, { useEffect, useState, useCallback } from 'react';
import { Paper, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, IconButton, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, CircularProgress, Snackbar, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddUserForm from '../../forms/AddUserForm';
import userUtil from '../../utils/user';
import Unauthorized from '../../components/error/Unauthorized';
import { is_admin } from '../../utils/permissions';

function ManageUsersPageContent() {
  const [open, setOpen] = useState(false);
  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ q: '' });
  const [editItem, setEditItem] = useState(null);
  const [showSalary, setShowSalary] = useState(false);
  const [currentUserKey, setCurrentUserKey] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  const loadUsers = useCallback(async ({ force: _force = false } = {}) => {
    setLoading(true);
    try {
      const users = await userUtil.fetchUsers();
      const list = users || [];
      setAllRows(list);
      setRows(list);
    } catch (e) { console.error('Failed to load users', e); setSnack({ open: true, message: 'Failed to load users', severity: 'error' }); }
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // load current user key to mark '(you)'
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cu = await userUtil.getCurrentUser();
        if (!mounted || !cu) return;
        const key = cu.userKey || cu.user_key || cu.userKey || cu.userId || cu.userId || cu.id || cu.userId || cu.userId;
        if (key) setCurrentUserKey(key);
      } catch (e) { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // apply client-side filtering when q changes, operate on allRows to avoid losing original list
    const q = (filters.q || '').toString().trim().toLowerCase();
    if (!q) {
      setRows(allRows || []);
      return;
    }
    const filtered = (allRows || []).filter(u => {
      const username = (u.username || u.user_name || u.name || '').toString().toLowerCase();
      const email = (u.email || u.email_address || '').toString().toLowerCase();
      const mobile = (u.mobile || u.phone || u.mobile_no || '').toString().toLowerCase();
      return username.includes(q) || email.includes(q) || mobile.includes(q);
    });
    setRows(filtered);
  }, [filters.q, allRows]);

  const getRowKey = (r) => r.userKey || r.user_key || r.userId || r.userId || r.id || r._id || r.userId;

  const getRoleForRow = (r) => {
    // prefer permission.level, then roles array, then legacy role/permissions field
    if (r.permission && (r.permission.level || r.permission.level === 0)) return r.permission.level;
    if (r.permission && r.permission.level) return r.permission.level;
    if (Array.isArray(r.roles) && r.roles.length > 0) return r.roles.join(', ');
    if (r.role) return r.role;
    if (r.permissions) return r.permissions;
    if (r.permission && typeof r.permission === 'string') return r.permission;
    return '';
  };

  const handleOpen = () => { setEditItem(null); setOpen(true); };
  const handleClose = () => { setEditItem(null); setOpen(false); };
  const handleEdit = (row) => { setEditItem(row); setOpen(true); };

  const handleDeleteClick = (row) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = () => { setToDelete(null); setConfirmOpen(false); };

  const handleConfirmDelete = async () => {
    if (!toDelete) { setConfirmOpen(false); return; }
    const row = toDelete;
    setConfirmOpen(false);
    const id = getRowKey(row);
    if (!id) { setSnack({ open: true, message: 'Cannot determine user id to delete', severity: 'error' }); return; }
    try {
      await userUtil.deleteUser(id);
      setSnack({ open: true, message: `Deleted user ${row.username || id}`, severity: 'success' });
      await loadUsers({ force: true });
    } catch (e) {
      setSnack({ open: true, message: 'Failed to delete user: ' + (e.message || e), severity: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editItem) {
        const id = getRowKey(editItem);
        await userUtil.updateUser(id, data);
        setSnack({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        await userUtil.addUser(data);
        setSnack({ open: true, message: 'User created successfully', severity: 'success' });
      }
      handleClose();
      await loadUsers({ force: true });
    } catch (e) { console.error('Failed to save user', e); setSnack({ open: true, message: 'Failed to save user: ' + (e.message || e), severity: 'error' }); }
  };

  const handleSnackClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnack(s => ({ ...s, open: false }));
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, margin: '24px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Manage Users</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>Create, search, edit and delete users within your account.</Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <Button variant="contained" onClick={handleOpen}>New User</Button>
        </Grid>
        <Grid item>
          <IconButton onClick={() => loadUsers({ force: true })} title="Refresh users">
            <RefreshIcon />
          </IconButton>
        </Grid>
        <Grid item>
          {loading ? <CircularProgress size={20} /> : null}
        </Grid>
        <Grid item>
          <IconButton onClick={() => setShowSalary(s => !s)} title={showSalary ? 'Hide salary' : 'Show salary'}>
            {showSalary ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </Grid>
        <Grid item sx={{ flex: 1 }}>
          <TextField fullWidth size="small" placeholder="Search by name, phone or email" value={filters.q} onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))} />
        </Grid>
      </Grid>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Details</TableCell>
              {showSalary && <TableCell align="right">Salary (INR)</TableCell>}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={getRowKey(r) || idx}>
                <TableCell>{(r.username || r.user_name || r.name || '') + (currentUserKey && String(currentUserKey) === String(getRowKey(r)) ? ' (you)' : '')}</TableCell>
                <TableCell>{r.email || r.email_address || ''}</TableCell>
                <TableCell>{r.mobile || r.phone || r.mobile_no || ''}</TableCell>
                <TableCell>{getRoleForRow(r)}</TableCell>
                <TableCell>{r.about || r.details || ''}</TableCell>
                {showSalary && (
                  <TableCell align="right">{(() => {
                    const ps = r.payslip || r.pay_slip || r.payslips || {};
                    const raw = ps.amount || r.salary || r.pay || '';
                    if (raw === null || raw === undefined || raw === '') return '';
                    const num = Number(raw);
                    if (!Number.isFinite(num)) return String(raw);
                    return num.toLocaleString();
                  })()}</TableCell>
                )}
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(r)} title="Edit"><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(r)} title="Delete"><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={showSalary ? 7 : 6}><Typography variant="body2">No users found.</Typography></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <AddUserForm initialData={editItem || {}} onSubmit={handleSubmit} onCancel={handleClose} />
      </Dialog>

      {/* Confirmation dialog for delete */}
      <Dialog open={confirmOpen} onClose={handleConfirmCancel}>
        <DialogTitle>Delete user</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete user "{toDelete ? (toDelete.username || toDelete.user_key || toDelete.id) : ''}"? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmCancel}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={6000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default function ManageUsersPage() {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cu = await userUtil.getCurrentUser();
        if (!mounted) return;
        setIsAdmin(!!is_admin(cu));
      } catch (e) {
        // fallback to non-admin
        if (!mounted) return;
        setIsAdmin(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (isAdmin === null) return (<div style={{ textAlign: 'center', marginTop: 60 }}><CircularProgress /></div>);
  if (isAdmin === false) return (<Unauthorized />);
  return <ManageUsersPageContent />;
}
