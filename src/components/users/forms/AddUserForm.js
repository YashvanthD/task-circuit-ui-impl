/**
 * AddUserForm Component
 * Form to add or edit a user.
 *
 * @module components/forms/user/AddUserForm
 */

import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Collapse,
  Grid,
  Alert,
} from '@mui/material';

// Utils
import { addUser, updateUser } from '../../../utils/user';
import userUtil from '../../../utils/user';
import { showSuccessAlert, showErrorAlert } from '../../../utils/alertManager';
import { FormContainer, FormSection, FormField, FormDropdown, FormActions } from '../../common/forms';

// Constants
const roleOptions = ['user', 'admin', 'manager'];
const actionOptions = ['view', 'edit', 'delete', 'create'];
const advancedSubforms = [
  { key: 'pay_slip', label: 'Update Pay Slips' },
  { key: 'details', label: 'Get User Details' },
  { key: 'account', label: 'Update Account Details' },
];

/**
 * AddUserForm - Form to add or edit a user using common components
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm((f) => ({
        ...f,
        username: initialData.username || initialData.user_name || initialData.userName || initialData.name || '',
        password: '',
        mobile: initialData.mobile || initialData.phone || initialData.mobile_no || '',
        email: initialData.email || initialData.email_address || '',
        permissions: initialData.permissions || initialData.role || initialData.user_role || '',
        actions: Array.isArray(initialData.actions) ? initialData.actions : (initialData.perms || []),
      }));

      if (initialData.payslip || initialData.pay_slip || initialData.payslips) {
        const ps = initialData.payslip || initialData.pay_slip || initialData.payslips;
        setPayslip({
          amount: ps.amount || ps.salary || '',
          date: ps.date || ps.payslip_date || '',
          notes: ps.notes || ps.note || '',
          document: ps.document || ps.url || '',
        });
      }

      if (initialData.account_key || initialData.accountKey || initialData.company_name) {
        setAccountDetails({
          account_key: initialData.account_key || initialData.accountKey || '',
          company_name: initialData.company_name || '',
        });
      }
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handlePayslipChange = (field, value) => {
    setPayslip((p) => ({ ...p, [field]: value }));
  };

  const handleAccountChange = (field, value) => {
    setAccountDetails((a) => ({ ...a, [field]: value }));
  };

  const internalSubmit = async (data) => {
    if (initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id)) {
      const id = initialData.user_key || initialData.userKey || initialData.id || initialData._id;
      return await updateUser(id, data);
    }
    return await addUser(data);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!form.username || !form.mobile || !form.email || !form.permissions) {
      setError('All required fields must be filled');
      showErrorAlert('All required fields must be filled', 'Validation Error');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };

      if (!initialData || !(initialData.user_key || initialData.id || initialData._id)) {
        if (payslip && (payslip.amount || payslip.date)) {
          payload.payslip = { ...payslip };
        }
        if (accountDetails && (accountDetails.account_key || accountDetails.company_name)) {
          payload.account = { ...accountDetails };
        }
      }

      if (!payload.password) delete payload.password;

      if (externalSubmit) {
        await externalSubmit(payload);
      } else {
        await internalSubmit(payload);
        const isEdit = initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id);
        showSuccessAlert(isEdit ? 'User updated successfully' : 'User created successfully');
      }

      if (onCancel) onCancel();
    } catch (err) {
      console.error('AddUserForm save failed', err);
      setError(err.message || 'Failed to save user');
      showErrorAlert(err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const getUserID = () => initialData && (initialData.user_key || initialData.userKey || initialData.id || initialData._id);

  const handleSavePayslip = async () => {
    const id = getUserID();
    if (!id) {
      showSuccessAlert('Will be saved with new user.');
      return;
    }
    setSavingPayslip(true);
    try {
      await updateUser(id, { payslip });
      showSuccessAlert('Payslip updated');
    } catch (e) {
      showErrorAlert('Failed to update payslip');
    } finally {
      setSavingPayslip(false);
    }
  };

  const handleSaveAccount = async () => {
    const id = getUserID();
    if (!id) {
      showSuccessAlert('Will be saved with new user.');
      return;
    }
    setSavingAccount(true);
    try {
      await updateUser(id, { account: accountDetails });
      showSuccessAlert('Account updated');
    } catch (e) {
      showErrorAlert('Failed to update account');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleFetchDetails = async () => {
    const id = getUserID();
    if (!id) return;
    try {
      const info = await userUtil.getUserInfo(id, true);
      setUserDetails(info);
    } catch (e) {
      showErrorAlert('Failed to fetch user details');
    }
  };

  const isEditing = Boolean(getUserID());

  return (
    <FormContainer
      title={isEditing ? 'Edit User' : 'Add User'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      <Grid container spacing={3}>
        {error && <Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>}

        <FormSection title="Credentials">
          <FormField
            label="Username"
            value={form.username}
            onChange={(e) => handleChange('username', e.target.value)}
            required
            xs={12} sm={6}
          />
          <FormField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            helperText={isEditing ? 'Leave empty to keep current password' : ''}
            xs={12} sm={6}
          />
        </FormSection>

        <FormSection title="Contact">
          <FormField
            label="Mobile"
            value={form.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            required
            xs={12} sm={6}
          />
          <FormField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            xs={12} sm={6}
          />
        </FormSection>

        <FormSection title="Permissions">
          <FormDropdown
            label="Role"
            value={form.permissions}
            onChange={(e, val) => handleChange('permissions', val)}
            options={roleOptions}
            required
            xs={12} sm={6}
          />
          <FormDropdown
            label="Actions"
            value={form.actions}
            onChange={(e, val) => handleChange('actions', val)}
            options={actionOptions}
            multiple
            xs={12} sm={6}
          />
        </FormSection>

        <Grid item xs={12}>
          <Button onClick={() => setAdvancedOpen(!advancedOpen)}>
            {advancedOpen ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
          <Collapse in={advancedOpen}>
            <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <FormDropdown
                label="Subform"
                value={activeSubform}
                onChange={(e, val) => setActiveSubform(val)}
                options={advancedSubforms}
                getOptionLabel={o => o.label || o}
                valueKey="key"
                xs={12}
              />

              <Box sx={{ mt: 2 }}>
                {activeSubform === 'pay_slip' && (
                  <Grid container spacing={2}>
                    <FormField label="Amount" value={payslip.amount} onChange={e => handlePayslipChange('amount', e.target.value)} xs={6} />
                    <FormField label="Date" type="date" value={payslip.date} onChange={e => handlePayslipChange('date', e.target.value)} xs={6} InputLabelProps={{ shrink: true }} />
                    <FormField label="Notes" value={payslip.notes} onChange={e => handlePayslipChange('notes', e.target.value)} xs={12} />
                    <Grid item xs={12}>
                      <Button variant="contained" onClick={handleSavePayslip} disabled={savingPayslip}>Save Payslip</Button>
                    </Grid>
                  </Grid>
                )}

                {activeSubform === 'account' && (
                  <Grid container spacing={2}>
                    <FormField label="Account Key" value={accountDetails.account_key} onChange={e => handleAccountChange('account_key', e.target.value)} xs={6} />
                    <FormField label="Company Name" value={accountDetails.company_name} onChange={e => handleAccountChange('company_name', e.target.value)} xs={6} />
                    <Grid item xs={12}>
                      <Button variant="contained" onClick={handleSaveAccount} disabled={savingAccount}>Save Account</Button>
                    </Grid>
                  </Grid>
                )}

                {activeSubform === 'details' && (
                  <Box>
                    <Button onClick={handleFetchDetails}>Refresh Details</Button>
                    {userDetails && <pre>{JSON.stringify(userDetails, null, 2)}</pre>}
                  </Box>
                )}
              </Box>
            </Box>
          </Collapse>
        </Grid>

        <FormActions
          submitText={isEditing ? "Update User" : "Create User"}
          loading={loading}
          onCancel={onCancel}
        />
      </Grid>
    </FormContainer>
  );
}
