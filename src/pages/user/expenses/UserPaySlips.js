import React, { useMemo, useState } from 'react';
import { Paper, Typography, Box, TextField, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material';
import { getDummyPayslips, formatCurrency } from '../../../utils/expenses';
import { loadUserFromLocalStorage } from '../../../utils/storage';
import { useLocation } from 'react-router-dom';

const months = [
  { v: 1, label: 'January' },{ v: 2, label: 'February' },{ v: 3, label: 'March' },{ v: 4, label: 'April' },{ v: 5, label: 'May' },{ v: 6, label: 'June' },
  { v: 7, label: 'July' },{ v: 8, label: 'August' },{ v: 9, label: 'September' },{ v: 10, label: 'October' },{ v: 11, label: 'November' },{ v: 12, label: 'December' }
];

export default function UserPaySlips() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialMonth = params.get('month') || '';
  const initialYear = params.get('year') || '';

  const user = loadUserFromLocalStorage();
  const userId = (user && (user.user || user).id) || (user && user.id) || 'u1';

  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  const all = getDummyPayslips(userId);
  const years = Array.from(new Set(all.map(p => p.year))).sort((a,b) => b-a);

  const filtered = useMemo(() => {
    const mNum = month ? Number(month) : null;
    const yNum = year ? Number(year) : null;
    return all.filter(p => (!mNum || mNum === p.month) && (!yNum || yNum === p.year));
  }, [all, month, year]);

  return (
    <Paper sx={{ p: 4, maxWidth: 900, margin: '24px auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Pay Slips</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>View your monthly pay slips and account summary.</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField select label="Month" value={month} onChange={(e)=>setMonth(e.target.value)} size="small">
          <MenuItem value="">All</MenuItem>
          {months.map(m => <MenuItem key={m.v} value={m.v}>{m.label}</MenuItem>)}
        </TextField>
        <TextField select label="Year" value={year} onChange={(e)=>setYear(e.target.value)} size="small">
          <MenuItem value="">All</MenuItem>
          {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </TextField>
        <Button variant="outlined" onClick={() => { setMonth(''); setYear(''); }}>Clear</Button>
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary">Showing {filtered.length} slips</Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Gross (₹)</TableCell>
              <TableCell>Tax (₹)</TableCell>
              <TableCell>Deductions (₹)</TableCell>
              <TableCell>Net (₹)</TableCell>
              <TableCell>Date Issued</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell>{months.find(m=>m.v===s.month)?.label || s.month}</TableCell>
                <TableCell>{s.year}</TableCell>
                <TableCell>{formatCurrency(s.gross)}</TableCell>
                <TableCell>{formatCurrency(s.tax)}</TableCell>
                <TableCell>{formatCurrency(s.deductions)}</TableCell>
                <TableCell>{formatCurrency(s.net)}</TableCell>
                <TableCell>{s.dateIssued}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
