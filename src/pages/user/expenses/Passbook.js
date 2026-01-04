import React, { useMemo, useState } from 'react';
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Box, TextField, Button } from '@mui/material';
import { getDummyPassbookEntries, formatCurrency } from '../../../utils/expenses';

const STORAGE_KEY = 'company_account_details';
function loadAccount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { companyName: 'Company Name', accountNumber: '', ifsc: '', bankName: '', branch: '', accountType: 'Current' };
  } catch (e) { return { companyName: 'Company Name', accountNumber: '', ifsc: '', bankName: '', branch: '', accountType: 'Current' }; }
}

function parseDateString(s) {
  // expect YYYY-MM-DD
  if (!s) return null;
  const parts = s.split('-');
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(p => parseInt(p, 10));
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  return new Date(y, m - 1, d);
}

export default function Passbook() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [descQ, setDescQ] = useState('');

  const entries = getDummyPassbookEntries();
  const account = loadAccount();
  const currentBalance = (entries && entries.length > 0) ? entries[0].balance : 0;

  const filtered = useMemo(() => {
    const fd = fromDate ? new Date(fromDate) : null; // fromDate is YYYY-MM-DD, Date constructor treats as UTC; acceptable for comparison
    const td = toDate ? new Date(toDate) : null;
    const dq = (descQ || '').toString().trim().toLowerCase();
    return entries.filter(e => {
      // parse entry date
      const ed = parseDateString(e.date);
      if (fd && ed && ed < fd) return false;
      if (td && ed && ed > td) return false;
      if (dq) {
        const hay = (e.description || '').toString().toLowerCase();
        if (!hay.includes(dq)) return false;
      }
      return true;
    });
  }, [entries, fromDate, toDate, descQ]);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setDescQ('');
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1100, margin: '24px auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Passbook</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Ledger of organization transactions.</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2">Account</Typography>
          <Typography variant="body1">{account.companyName} - {account.accountNumber}</Typography>
          <Typography variant="caption" color="text.secondary">{account.bankName} • {account.branch} • {account.ifsc}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="subtitle2">Account Type</Typography>
          <Typography variant="body1">{account.accountType || 'Current'}</Typography>
          <Typography variant="caption" color="text.secondary">Current Balance</Typography>
          <Typography variant="h6">₹{formatCurrency(currentBalance)}</Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <TextField
          label="From"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          size="small"
        />
        <TextField
          label="To"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          size="small"
        />
        <TextField
          label="Description"
          placeholder="Search description"
          value={descQ}
          onChange={(e) => setDescQ(e.target.value)}
          size="small"
        />
        <Button variant="outlined" onClick={clearFilters}>Clear</Button>
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary">Showing {filtered.length} of {entries.length} entries</Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell align="right">Debit (₹)</TableCell>
              <TableCell align="right">Credit (₹)</TableCell>
              <TableCell align="right">Balance (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((e, idx) => (
              <TableRow key={idx}>
                <TableCell>{e.date}</TableCell>
                <TableCell>{e.description}</TableCell>
                <TableCell>{e.reference}</TableCell>
                <TableCell align="right" sx={{ color: e.type === 'debit' ? 'error.main' : 'text.secondary' }}>{e.type === 'debit' ? formatCurrency(e.amount) : ''}</TableCell>
                <TableCell align="right" sx={{ color: e.type === 'credit' ? 'success.main' : 'text.secondary' }}>{e.type === 'credit' ? formatCurrency(e.amount) : ''}</TableCell>
                <TableCell align="right">{formatCurrency(e.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
