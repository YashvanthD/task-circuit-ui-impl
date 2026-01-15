import React, { useState, useEffect } from 'react';
import { Paper, Typography, TextField, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, MenuItem, Stack, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { loadUserFromLocalStorage } from '../../../utils/auth/storage';
import { useNavigate } from 'react-router-dom';
import { getDummyPayslips } from '../../../utils/expenses';
import { BASE_APP_PATH_USER_EXPENSES_PAYSLIPS } from '../../../config';

const STORAGE_KEY = 'user_account_details';
function loadUserAccount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { accountNumber: '', ifsc: '', bankName: '', branch: '', accountType: 'Savings' };
  } catch (e) { return { accountNumber: '', ifsc: '', bankName: '', branch: '', accountType: 'Savings' }; }
}

export default function MyAccount() {
   const navigate = useNavigate();

  const [account, setAccount] = useState(loadUserAccount());
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(account);
  const [selectedMonthYear, setSelectedMonthYear] = useState('');
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // run once on mount — read fresh user inside the effect to avoid triggering re-runs
    setAccount(loadUserAccount());
    setForm(loadUserAccount());
    const currentUser = loadUserFromLocalStorage();
    const userId = (currentUser && (currentUser.user || currentUser).id) || (currentUser && currentUser.id) || 'u1';
    const slips = getDummyPayslips(userId) || [];
    // unique month-year pairs
    const pairs = [];
    slips.forEach(s => {
      const key = `${s.month}-${s.year}`;
      if (!pairs.find(p => p.key === key)) pairs.push({ key, month: s.month, year: s.year });
    });
    // sort latest first (year desc, month desc)
    pairs.sort((a, b) => (b.year - a.year) || (b.month - a.month));
    // map to label
    const labels = pairs.map(p => ({ value: p.key, label: `${new Date(p.year, p.month - 1).toLocaleString(undefined, { month: 'short' })} ${p.year}`, month: p.month, year: p.year }));
    setOptions(labels);
    if (labels.length > 0) setSelectedMonthYear(labels[0].value);
  }, []);

  const openEdit = () => {
    setForm(account);
    setEditOpen(true);
  };
  const closeEdit = () => setEditOpen(false);
  const saveEdit = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setAccount(form);
    setEditOpen(false);
  };

  const handleSubmitPayslip = () => {
    if (!selectedMonthYear) return;
    const [m, y] = selectedMonthYear.split('-').map(Number);
    // note: options stored as month-year; navigate with month & year
    navigate(`${BASE_APP_PATH_USER_EXPENSES_PAYSLIPS}?month=${m}&year=${y}`);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: '24px auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>My Account</Typography>
          <Typography variant="body2" color="text.secondary">Personal account details and payment information (view only).</Typography>
        </Box>
        <IconButton aria-label="edit" onClick={openEdit}>
          <EditIcon />
        </IconButton>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Account Number</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{account.accountNumber || '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Account Type</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{account.accountType || '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Bank</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{account.bankName || '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Branch / IFSC</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{account.branch || '—'} {account.ifsc ? `• ${account.ifsc}` : ''}</Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h6">Payslip</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Choose a month and year to view your payslip.</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
          <TextField select label="Month / Year" value={selectedMonthYear} onChange={(e) => setSelectedMonthYear(e.target.value)} size="small" sx={{ minWidth: 220 }}>
            {options.length === 0 ? <MenuItem value="">No payslips available</MenuItem> : options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <Button variant="contained" onClick={handleSubmitPayslip} disabled={!selectedMonthYear}>Submit</Button>
        </Box>
      </Box>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Update Account</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField label="Account Number" value={form.accountNumber} onChange={(e) => setForm(f => ({ ...f, accountNumber: e.target.value }))} />
            <TextField label="Account Type" value={form.accountType} onChange={(e) => setForm(f => ({ ...f, accountType: e.target.value }))} />
            <TextField label="IFSC" value={form.ifsc} onChange={(e) => setForm(f => ({ ...f, ifsc: e.target.value }))} />
            <TextField label="Bank Name" value={form.bankName} onChange={(e) => setForm(f => ({ ...f, bankName: e.target.value }))} />
            <TextField label="Branch" value={form.branch} onChange={(e) => setForm(f => ({ ...f, branch: e.target.value }))} />
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
