/**
 * ManageUsersPage
 * Admin page for user management.
 * Uses modular components for clean separation.
 *
 * @module pages/user/ManageUsersPage
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Paper,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';

// Components
import { UserList, UserFilters, UserStats, UserFormDialog } from '../../components/users';
import { ConfirmDialog } from '../../components/common';
import Unauthorized from '../../components/error/Unauthorized';

// Utils
import userUtil from '../../utils/user';
import { filterUsers, resolveUserId } from '../../utils/helpers/users';
import { is_admin } from '../../utils/auth/permissions';
import { loadUserFromLocalStorage, getAccessToken } from '../../utils/auth/storage';

// Constants
import { INITIAL_USER_FORM } from '../../constants';

// ============================================================================
// Main Content Component
// ============================================================================

function ManageUsersPageContent() {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_USER_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Snackbar
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userUtil.fetchUsers();
      setUsers(data || []);
    } catch (e) {
      console.error('Failed to load users', e);
      setError('Failed to load users');
      setSnack({ open: true, message: 'Failed to load users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load current user
  useEffect(() => {
    loadUsers();

    (async () => {
      try {
        const cu = await userUtil.getCurrentUser();
        if (cu) setCurrentUser(cu);
      } catch (e) {}
    })();
  }, [loadUsers]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return filterUsers(users, {
      role: roleFilter,
      status: statusFilter,
      searchTerm,
    });
  }, [users, roleFilter, statusFilter, searchTerm]);

  // Handlers
  const handleAddNew = useCallback(() => {
    setForm(INITIAL_USER_FORM);
    setFormErrors({});
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((user) => {
    setForm({
      ...INITIAL_USER_FORM,
      ...user,
      user_id: resolveUserId(user),
    });
    setFormErrors({});
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setForm(INITIAL_USER_FORM);
    setFormErrors({});
  }, []);

  const handleFormChange = useCallback((newForm) => {
    setForm(newForm);
  }, []);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      const isEdit = !!form.user_id || !!form.user_key;

      if (isEdit) {
        const id = form.user_id || form.user_key;
        await userUtil.updateUser(id, form);
        setSnack({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        await userUtil.addUser(form);
        setSnack({ open: true, message: 'User created successfully', severity: 'success' });
      }

      handleDialogClose();
      await loadUsers();
    } catch (e) {
      console.error('Failed to save user', e);
      setSnack({ open: true, message: 'Failed to save user: ' + (e.message || e), severity: 'error' });
    }
  }, [form, handleDialogClose, loadUsers]);

  const handleDelete = useCallback((user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!userToDelete) return;

    const id = resolveUserId(userToDelete);
    try {
      await userUtil.deleteUser(id);
      setSnack({ open: true, message: 'User deleted successfully', severity: 'success' });
      await loadUsers();
    } catch (e) {
      setSnack({ open: true, message: 'Failed to delete user: ' + (e.message || e), severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, loadUsers]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, []);

  const handleSnackClose = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, margin: '24px auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Manage Users
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create, search, edit and delete users within your account.
        </Typography>
      </Box>

      {/* Stats */}
      <UserStats users={users} />

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onAddNew={handleAddNew}
      />

      {/* Error */}
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* User List */}
      <UserList
        users={filteredUsers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentUser={currentUser}
      />

      {/* Add/Edit Dialog */}
      <UserFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        form={form}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
        errors={formErrors}
        canChangeRole={is_admin(currentUser)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${userToDelete?.username || userToDelete?.email || 'this user'}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        confirmColor="error"
      />

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={6000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

// ============================================================================
// Main Export with Auth Check
// ============================================================================

export default function ManageUsersPage() {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Quick: prefer explicit is_admin flag stored at login
        const rawFlag = localStorage.getItem('is_admin');
        if (rawFlag !== null) {
          if (!mounted) return;
          setIsAdmin(JSON.parse(rawFlag) === true);
          return;
        }

        // Next: prefer stored user in localStorage (fast, no network)
        const stored = loadUserFromLocalStorage();
        if (stored) {
          if (!mounted) return;
          setIsAdmin(!!is_admin(stored));
          return;
        }

        // If there's no access token, don't call the API
        const token = getAccessToken();
        if (!token) {
          if (!mounted) return;
          setIsAdmin(false);
          return;
        }

        // Last resort: call API to fetch current user
        const cu = await userUtil.getCurrentUser();
        if (!mounted) return;
        setIsAdmin(!!is_admin(cu));
      } catch (e) {
        if (!mounted) return;
        setIsAdmin(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (isAdmin === null) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAdmin === false) {
    return <Unauthorized />;
  }

  return <ManageUsersPageContent />;
}
