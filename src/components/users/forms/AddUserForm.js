/**
 * AddUserForm Component
 * Form to add or edit a user.
 *
 * @module components/forms/user/AddUserForm
 */

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  OutlinedInput,
  Chip,
} from '@mui/material';

// Utils
import { addUser, updateUser } from '../../../utils/user';
import userUtil from '../../../utils/user';
import { showSuccessAlert, showErrorAlert } from '../../../utils/alertManager';

// Constants
const roleOptions = ['user', 'admin', 'manager'];
const actionOptions = ['view', 'edit', 'delete', 'create'];
const advancedSubforms = [
  { key: 'pay_slip', label: 'Update Pay Slips' },
  { key: 'details', label: 'Get User Details' },
  { key: 'account', label: 'Update Account Details' },
];

/**
 * AddUserForm - Form to add or edit a user
 *
 * @param {Object} props
 * @param {Object} props.initialData - Optional object to prefill fields (edit case)
 * @param {Function} props.onSubmit - Optional callback(formData) - if provided, form will call this instead of internal API
 * @param {Function} props.onCancel - Optional callback() - called when cancel button clicked
 */
export default function AddUserForm({ initialData = {}, onSubmit: externalSubmit, onCancel }) {
  const [form, setForm] = useState({
    username: '',
    password: '123',
    mobile: '1234567890',
    email: 'a@b.c',
    permissions: '',
    actions: [],
  });
  const [error, setError] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [activeSubform, setActiveSubform] = useState('pay_slip');
  const [payslip, setPayslip] = useState({ amount: '', date: '', notes: '', document: '' });
  const [savingPayslip, setSavingPayslip] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [accountDetails, setAccountDetails] = useState({ account_key: '', company_name: '' });
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm((f) => ({
        ...f,
        username: initialData.username || initialData.user_name || initialData.userName || initialData.name || '',
        password: '',
        mobile: initialData.mobile || initialData.phone || initialData.mobile_no || '',
        email: initialData.email || initialData.email_address || '',
        permissions: initialData.permissions || initialData.role || initialData.user_role || '',
        actions: initialData.actions || initialData.perms || [],
      }));

      // Populate payslip if present
      if (initialData.payslip || initialData.pay_slip || initialData.payslips) {
        const ps = initialData.payslip || initialData.pay_slip || initialData.payslips;
        setPayslip({
          amount: ps.amount || ps.salary || '',
          date: ps.date || ps.payslip_date || '',
          notes: ps.notes || ps.note || '',
          document: ps.document || ps.url || '',
        });
      }

      // Populate account details
      if (initialData.account_key || initialData.accountKey || initialData.company_name) {
        setAccountDetails({
          account_key: initialData.account_key || initialData.accountKey || '',
          company_name: initialData.company_name || '',
        });
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleActionsChange = (event) => {
    const { target: { value } } = event;
    setForm((f) => ({ ...f, actions: typeof value === 'string' ? value.split(',') : value }));
  };

  const handlePayslipChange = (e) => {
    const { name, value } = e.target;
    setPayslip((p) => ({ ...p, [name]: value }));
  };

  const internalSubmit = async (data) => {
    if (initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id)) {
      const id = initialData.user_key || initialData.userKey || initialData.id || initialData._id;
      return await updateUser(id, data);
    }
    return await addUser(data);
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError('');

    if (!form.username || !form.mobile || !form.email || !form.permissions) {
      setError('All required fields must be filled');
      showErrorAlert('All required fields must be filled', 'Validation Error');
      return;
    }

    try {
      const payload = { ...form };

      // Attach payslip and account for new user creation
      if (!initialData || !(initialData.user_key || initialData.id || initialData._id)) {
        if (payslip && (payslip.amount || payslip.date || payslip.notes || payslip.document)) {
          payload.payslip = { ...payslip };
        }
        if (accountDetails && (accountDetails.account_key || accountDetails.company_name)) {
          payload.account = { ...accountDetails };
        }
      }

      // Remove empty password during edit
      if (!payload.password) delete payload.password;

      if (externalSubmit) {
        await externalSubmit(payload);
      } else {
        await internalSubmit(payload);
        const isEdit = initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id);
        showSuccessAlert(isEdit ? 'User updated successfully' : 'User created successfully');

        // Clear form only for create
        if (!isEdit) {
          setForm({ username: '', password: '', mobile: '', email: '', permissions: '', actions: [] });
          setPayslip({ amount: '', date: '', notes: '', document: '' });
          setAccountDetails({ account_key: '', company_name: '' });
        }
      }

      if (onCancel) onCancel();
    } catch (err) {
      console.error('AddUserForm save failed', err);
      setError(err.message || 'Failed to save user');
      showErrorAlert(err.message || 'Failed to save user');
    }
  };

  const handleSavePayslip = async () => {
    setError('');

    if (!payslip.amount || !payslip.date) {
      setError('Payslip amount and date are required');
      showErrorAlert('Payslip amount and date are required', 'Validation Error');
      return;
    }

    const id = initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id);
    if (!id) {
      showSuccessAlert('Payslip attached to the create payload. Save the user to persist.');
      return;
    }

    try {
      setSavingPayslip(true);
      const payload = { payslip: { amount: payslip.amount, date: payslip.date, notes: payslip.notes, document: payslip.document } };
      await updateUser(id, payload);
      showSuccessAlert('Payslip updated successfully');
    } catch (e) {
      console.error('Failed to update payslip', e);
      setError(e.message || 'Failed to update payslip');
      showErrorAlert(e.message || 'Failed to update payslip');
    } finally {
      setSavingPayslip(false);
    }
  };

  const handleFetchDetails = async () => {
    setError('');

    const id = initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id);
    if (!id) {
      setError('No user id present to fetch details');
      showErrorAlert('No user id present to fetch details');
      return;
    }

    try {
      const info = await userUtil.getUserInfo(id, true);
      setUserDetails(info || null);
      showSuccessAlert('Fetched latest user details');
    } catch (e) {
      console.error('Failed to fetch user details', e);
      setError(e.message || 'Failed to fetch user details');
      showErrorAlert(e.message || 'Failed to fetch user details');
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails((a) => ({ ...a, [name]: value }));
  };

  const handleSaveAccount = async () => {
    setError('');

    if (!accountDetails.account_key && !accountDetails.company_name) {
      setError('Enter account details to save');
      showErrorAlert('Enter account details to save', 'Validation Error');
      return;
    }

    const id = initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id);
    if (!id) {
      showSuccessAlert('Account details attached to create payload. Save the user to persist.');
      return;
    }

    try {
      setSavingAccount(true);
      const payload = { account: { ...accountDetails } };
      await updateUser(id, payload);
      showSuccessAlert('Account details updated');
    } catch (e) {
      console.error('Failed to update account', e);
      setError(e.message || 'Failed to update account details');
      showErrorAlert(e.message || 'Failed to update account details');
    } finally {
      setSavingAccount(false);
    }
  };

  const isEditing = initialData && (initialData.user_key || initialData.id);

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, margin: '24px auto' }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Edit User' : 'Add User'}
      </Typography>

      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField
          label="Username"
          name="username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={form.username}
          onChange={handleChange}
          required
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={form.password}
          onChange={handleChange}
          helperText={isEditing ? 'Leave empty to keep existing password' : ''}
        />

        <TextField
          label="Mobile"
          name="mobile"
          type="tel"
          variant="outlined"
          fullWidth
          margin="normal"
          value={form.mobile}
          onChange={handleChange}
          required
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={form.email}
          onChange={handleChange}
          required
        />

        <TextField
          select
          label="Permissions (Role)"
          name="permissions"
          variant="outlined"
          fullWidth
          margin="normal"
          value={form.permissions}
          onChange={handleChange}
          required
        >
          {roleOptions.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </TextField>

        <FormControl fullWidth margin="normal">
          <InputLabel id="actions-label">Actions</InputLabel>
          <Select
            labelId="actions-label"
            id="actions-select"
            multiple
            value={form.actions}
            onChange={handleActionsChange}
            input={<OutlinedInput label="Actions" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => (
                  <Chip key={val} label={val} size="small" />
                ))}
              </Box>
            )}
            variant="outlined"
          >
            {actionOptions.map((action) => (
              <MenuItem key={action} value={action}>
                {action}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Advanced options toggle */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <Button size="small" variant="outlined" onClick={() => setAdvancedOpen((a) => !a)}>
            {advancedOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </Button>
        </Box>

        <Collapse in={advancedOpen}>
          <Box sx={{ mt: 2, p: 2, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 1 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="subform-select-label">Advanced Subform</InputLabel>
              <Select
                labelId="subform-select-label"
                label="Advanced Subform"
                value={activeSubform}
                onChange={(e) => setActiveSubform(e.target.value)}
                variant="outlined"
              >
                {advancedSubforms.map((s) => (
                  <MenuItem key={s.key} value={s.key}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Pay Slip subform */}
            {activeSubform === 'pay_slip' && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Update Pay Slips
                </Typography>
                <TextField
                  label="Amount (INR)"
                  name="amount"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={payslip.amount}
                  onChange={handlePayslipChange}
                />
                <TextField
                  label="Payslip Date"
                  name="date"
                  type="date"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  value={payslip.date}
                  onChange={handlePayslipChange}
                />
                <TextField
                  label="Notes"
                  name="notes"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={payslip.notes}
                  onChange={handlePayslipChange}
                />
                <TextField
                  label="Document URL"
                  name="document"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={payslip.document}
                  onChange={handlePayslipChange}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button variant="contained" onClick={handleSavePayslip} disabled={savingPayslip}>
                    {savingPayslip ? 'Saving...' : 'Save PaySlip'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setPayslip({ amount: '', date: '', notes: '', document: '' })}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            )}

            {/* Get User Details subform */}
            {activeSubform === 'details' && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  User Details
                </Typography>
                <Button variant="outlined" onClick={handleFetchDetails}>
                  Refresh Details
                </Button>
                {userDetails && (
                  <Box sx={{ mt: 2, fontSize: 12, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(userDetails, null, 2)}
                  </Box>
                )}
              </Box>
            )}

            {/* Update Account Details subform */}
            {activeSubform === 'account' && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Account Details
                </Typography>
                <TextField
                  label="Account Key"
                  name="account_key"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={accountDetails.account_key}
                  onChange={handleAccountChange}
                />
                <TextField
                  label="Company Name"
                  name="company_name"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={accountDetails.company_name}
                  onChange={handleAccountChange}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button variant="contained" onClick={handleSaveAccount} disabled={savingAccount}>
                    {savingAccount ? 'Saving...' : 'Save Account'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setAccountDetails({ account_key: '', company_name: '' })}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

