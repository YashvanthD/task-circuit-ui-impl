import React, { useState, useEffect } from 'react';
import { Paper, Typography, TextField, Button, Box } from '@mui/material';

const STORAGE_KEY = 'company_account_details';

function loadAccount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { companyName: 'Company Name', accountNumber: '', ifsc: '', bankName: '', branch: '', accountType: 'Current' };
  } catch (e) { return { companyName: 'Company Name', accountNumber: '', ifsc: '', bankName: '', branch: '', accountType: 'Current' }; }
}

export default function CompanyAccount() {
  const [account, setAccount] = useState(loadAccount());
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // when component mounts, load latest
    setAccount(loadAccount());
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    setEditing(false);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: '24px auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>{account.companyName} Account</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Bank account details for the company.</Typography>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <TextField label="Company Name" value={account.companyName} onChange={(e) => setAccount(a => ({ ...a, companyName: e.target.value }))} disabled={!editing} />
        <TextField label="Account Number" value={account.accountNumber} onChange={(e) => setAccount(a => ({ ...a, accountNumber: e.target.value }))} disabled={!editing} />
        <TextField label="Account Type" value={account.accountType} onChange={(e) => setAccount(a => ({ ...a, accountType: e.target.value }))} disabled={!editing} />
        <TextField label="IFSC" value={account.ifsc} onChange={(e) => setAccount(a => ({ ...a, ifsc: e.target.value }))} disabled={!editing} />
        <TextField label="Bank Name" value={account.bankName} onChange={(e) => setAccount(a => ({ ...a, bankName: e.target.value }))} disabled={!editing} />
        <TextField label="Branch" value={account.branch} onChange={(e) => setAccount(a => ({ ...a, branch: e.target.value }))} disabled={!editing} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          {editing ? (
            <>
              <Button variant="contained" onClick={handleSave}>Save</Button>
              <Button variant="outlined" onClick={() => setEditing(false)}>Cancel</Button>
            </>
          ) : (
            <Button variant="contained" onClick={() => setEditing(true)}>Edit</Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
