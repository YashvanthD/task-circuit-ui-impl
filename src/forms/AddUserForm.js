import React, { useState, useEffect } from 'react';
import { TextField, Button, Paper, Typography, Box, MenuItem, Select, FormControl, InputLabel, Collapse, OutlinedInput, Chip } from '@mui/material';
import { addUser, updateUser } from '../utils/user';
import userUtil from '../utils/user';

/**
 * AddUserForm - Form to add or edit a user
 * Props:
 *  - initialData: optional object to prefill fields (edit case)
 *  - onSubmit: optional callback(formData) - if provided, form will call this instead of internal API
 *  - onCancel: optional callback() - called when cancel button clicked (useful inside Dialog)
 */
const roleOptions = ['user', 'admin', 'manager'];
const actionOptions = ['view', 'edit', 'delete', 'create'];
const advancedSubforms = [
  { key: 'pay_slip', label: 'Update Pay Slips' },
  { key: 'details', label: 'Get User Details' },
  { key: 'account', label: 'Update Account Details' }
];

export default function AddUserForm({ initialData = {}, onSubmit: externalSubmit, onCancel }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    mobile: '',
    email: '',
    permissions: '',
    actions: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [activeSubform, setActiveSubform] = useState('pay_slip');
  const [payslip, setPayslip] = useState({ amount: '', date: '', notes: '', document: '' });
  const [savingPayslip, setSavingPayslip] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [accountDetails, setAccountDetails] = useState({ account_key: '', company_name: '' });
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(f => ({
        ...f,
        username: initialData.username || initialData.user_name || initialData.userName || initialData.name || '',
        // password should remain empty when editing
        password: '',
        mobile: initialData.mobile || initialData.phone || initialData.mobile_no || '',
        email: initialData.email || initialData.email_address || '',
        permissions: initialData.permissions || initialData.role || initialData.user_role || '',
        actions: initialData.actions || initialData.perms || [],
      }));
      // populate payslip if present
      if (initialData.payslip || initialData.pay_slip || initialData.payslips) {
        const ps = initialData.payslip || initialData.pay_slip || initialData.payslips;
        setPayslip({
          amount: ps.amount || ps.salary || '',
          date: ps.date || ps.payslip_date || '',
          notes: ps.notes || ps.note || '',
          document: ps.document || ps.url || ''
        });
      }
      // populate account details
      if (initialData.account_key || initialData.accountKey || initialData.company_name) {
        setAccountDetails({ account_key: initialData.account_key || initialData.accountKey || '', company_name: initialData.company_name || '' });
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleActionsChange = (event) => {
    const { target: { value } } = event;
    setForm(f => ({ ...f, actions: typeof value === 'string' ? value.split(',') : value }));
  };

  const handlePayslipChange = (e) => {
    const { name, value } = e.target;
    setPayslip(p => ({ ...p, [name]: value }));
  };

  const internalSubmit = async (data) => {
    // if initialData has an id/key, call updateUser, else addUser
    try {
      if (initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id)) {
        const id = initialData.user_key || initialData.userKey || initialData.id || initialData._id;
        return await updateUser(id, data);
      }
      return await addUser(data);
    } catch (e) {
      throw e;
    }
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.username || !form.mobile || !form.email || !form.permissions) {
      setError('All required fields must be filled');
      return;
    }
    try {
      const payload = { ...form };
      // attach payslip to payload for create or when not saving separately
      if (!initialData || !(initialData.user_key || initialData.id || initialData._id)) {
        // creating a new user: include payslip if provided
        if (payslip && (payslip.amount || payslip.date || payslip.notes || payslip.document)) {
          payload.payslip = { ...payslip };
        }
        // attach account details for create
        if (accountDetails && (accountDetails.account_key || accountDetails.company_name)) {
          payload.account = { ...accountDetails };
        }
      }
      // if password empty during edit, remove it to avoid overwriting
      if (!payload.password) delete payload.password;
      if (externalSubmit) {
        await externalSubmit(payload);
        setSuccess('Saved');
      } else {
        await internalSubmit(payload);
        setSuccess('User saved successfully!');
        // clear form only for create
        if (!initialData || !(initialData.user_key || initialData.userKey || initialData.id || initialData._id)) {
          setForm({ username: '', password: '', mobile: '', email: '', permissions: '', actions: [] });
          setPayslip({ amount: '', date: '', notes: '', document: '' });
          setAccountDetails({ account_key: '', company_name: '' });
        }
      }
      if (onCancel) onCancel();
    } catch (err) {
      console.error('AddUserForm save failed', err);
      setError(err.message || 'Failed to save user');
    }
  };

  const handleSavePayslip = async () => {
    setError('');
    setSuccess('');
    if (!payslip.amount || !payslip.date) {
      setError('Payslip amount and date are required');
      return;
    }
    // If editing an existing user, call updateUser to save payslip immediately
    const id = initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id);
    if (!id) {
      // if not editing, just attach payslip to the form so it will be sent on create
      setSuccess('Payslip attached to the create payload. Save the user to persist.');
      return;
    }
    try {
      setSavingPayslip(true);
      const payload = { payslip: { amount: payslip.amount, date: payslip.date, notes: payslip.notes, document: payslip.document } };
      await updateUser(id, payload);
      setSuccess('Payslip updated successfully');
    } catch (e) {
      console.error('Failed to update payslip', e);
      setError(e.message || 'Failed to update payslip');
    } finally {
      setSavingPayslip(false);
    }
  };

  const handleFetchDetails = async () => {
    setError('');
    setSuccess('');
    const id = initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id);
    if (!id) { setError('No user id present to fetch details'); return; }
    try {
      const info = await userUtil.getUserInfo(id, true);
      setUserDetails(info || null);
      setSuccess('Fetched latest user details');
    } catch (e) {
      console.error('Failed to fetch user details', e);
      setError(e.message || 'Failed to fetch user details');
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails(a => ({ ...a, [name]: value }));
  };

  const handleSaveAccount = async () => {
    setError('');
    setSuccess('');
    if (!accountDetails.account_key && !accountDetails.company_name) { setError('Enter account details to save'); return; }
    const id = initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id);
    if (!id) {
      setSuccess('Account details attached to create payload. Save the user to persist.');
      return;
    }
    try {
      setSavingAccount(true);
      const payload = { account: { ...accountDetails } };
      await updateUser(id, payload);
      setSuccess('Account details updated');
    } catch (e) {
      console.error('Failed to update account', e);
      setError(e.message || 'Failed to update account details');
    } finally {
      setSavingAccount(false);
    }
  };

  return (
    <Paper elevation={3} sx={{padding:4, maxWidth:600, margin:'24px auto'}}>
      <Typography variant="h6" gutterBottom>{initialData && (initialData.user_key || initialData.id) ? 'Edit User' : 'Add User'}</Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField label="Username" name="username" variant="outlined" fullWidth margin="normal" value={form.username} onChange={handleChange} required />
        <TextField label="Password" name="password" type="password" variant="outlined" fullWidth margin="normal" value={form.password} onChange={handleChange} helperText={initialData && (initialData.user_key || initialData.id) ? 'Leave empty to keep existing password' : ''} />
        <TextField label="Mobile" name="mobile" type="tel" variant="outlined" fullWidth margin="normal" value={form.mobile} onChange={handleChange} required />
        <TextField label="Email" name="email" type="email" variant="outlined" fullWidth margin="normal" value={form.email} onChange={handleChange} required />
        <TextField select label="Permissions (Role)" name="permissions" variant="outlined" fullWidth margin="normal" value={form.permissions} onChange={handleChange} required>
          {roleOptions.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
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
                {selected.map((val) => (<Chip key={val} label={val} size="small" />))}
              </Box>
            )}
            variant="outlined"
          >
            {actionOptions.map(action => <MenuItem key={action} value={action}>{action}</MenuItem>)}
          </Select>
        </FormControl>

        {/* Advanced options toggle */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <Button size="small" variant="outlined" onClick={() => setAdvancedOpen(a => !a)}>{advancedOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}</Button>
        </Box>

        <Collapse in={advancedOpen}>
          <Box sx={{ mt: 2, p: 2, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 1 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="subform-select-label">Advanced Subform</InputLabel>
              <Select labelId="subform-select-label" label="Advanced Subform" value={activeSubform} onChange={(e) => setActiveSubform(e.target.value)} variant="outlined">
                {advancedSubforms.map(s => <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Pay Slip subform */}
            {activeSubform === 'pay_slip' && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Update Pay Slips</Typography>
                <TextField label="Amount (INR)" name="amount" variant="outlined" fullWidth margin="normal" value={payslip.amount} onChange={handlePayslipChange} />
                <TextField label="Payslip Date" name="date" type="date" variant="outlined" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={payslip.date} onChange={handlePayslipChange} />
                <TextField label="Notes" name="notes" variant="outlined" fullWidth margin="normal" value={payslip.notes} onChange={handlePayslipChange} />
                <TextField label="Document URL" name="document" variant="outlined" fullWidth margin="normal" value={payslip.document} onChange={handlePayslipChange} />
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button variant="contained" onClick={handleSavePayslip} disabled={savingPayslip}>{savingPayslip ? 'Saving...' : 'Save PaySlip'}</Button>
                  <Button variant="outlined" onClick={() => setPayslip({ amount: '', date: '', notes: '', document: '' })}>Clear</Button>
                </Box>
              </Box>
            )}

            {/* Get User Details subform */}
            {activeSubform === 'details' && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>User Details</Typography>
                <Button variant="outlined" onClick={handleFetchDetails}>Refresh Details</Button>
                {userDetails && (
                  <Box sx={{ mt: 2, fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(userDetails, null, 2)}</Box>
                )}
              </Box>
            )}

            {/* Update Account Details subform */}
            {activeSubform === 'account' && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Account Details</Typography>
                <TextField label="Account Key" name="account_key" variant="outlined" fullWidth margin="normal" value={accountDetails.account_key} onChange={handleAccountChange} />
                <TextField label="Company Name" name="company_name" variant="outlined" fullWidth margin="normal" value={accountDetails.company_name} onChange={handleAccountChange} />
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button variant="contained" onClick={handleSaveAccount} disabled={savingAccount}>{savingAccount ? 'Saving...' : 'Save Account'}</Button>
                  <Button variant="outlined" onClick={() => setAccountDetails({ account_key: '', company_name: '' })}>Clear</Button>
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>

        {error && <Typography color="error" mt={2}>{error}</Typography>}
        {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" color="primary" type="submit">Save</Button>
          {onCancel ? <Button variant="outlined" onClick={onCancel}>Cancel</Button> : null}
        </Box>
      </Box>
    </Paper>
  );
}
