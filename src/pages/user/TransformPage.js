import React, { useEffect, useState } from 'react';
import { Paper, Typography, Button, Dialog, DialogTitle, DialogContent, Stack, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { TransformForm } from '../../components/pond/forms';

const STORAGE_KEY = 'transforms_v1';

function loadTransforms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) { return []; }
}
function saveTransforms(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { }
}

export default function TransformPage() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);

  const load = () => {
    const items = loadTransforms();
    setRows(items.slice(0, 100));
  };

  useEffect(() => { load(); }, []);

  const handleNew = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = (payload) => {
    const item = { id: String(Date.now()), createdAt: new Date().toISOString(), ...payload };
    const updated = [item, ...rows].slice(0, 100);
    setRows(updated);
    saveTransforms(updated);
    setOpen(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this transform record?')) return;
    const updated = rows.filter(r => r.id !== id);
    setRows(updated);
    saveTransforms(updated);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, margin: '24px auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <div>
          <Typography variant="h4">Transform Fish</Typography>
          <Typography variant="body2">Move fish between ponds or record sales.</Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={load} title="Refresh"><RefreshIcon /></IconButton>
          <Button variant="contained" onClick={handleNew}>New Transform</Button>
        </Stack>
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>Recent transforms</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>From pond</TableCell>
              <TableCell>To pond</TableCell>
              <TableCell>Count</TableCell>
              <TableCell>Avg weight (g)</TableCell>
              <TableCell>Amount (INR)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                <TableCell>{r.eventType}</TableCell>
                <TableCell>{r.fromPond || ''}</TableCell>
                <TableCell>{r.toPond || ''}</TableCell>
                <TableCell>{r.count}</TableCell>
                <TableCell>{r.avgWeight}</TableCell>
                <TableCell>{r.totalAmount || ''}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleDelete(r.id)} title="Delete"><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}><Typography variant="body2">No transforms recorded.</Typography></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>New Transform</DialogTitle>
        <DialogContent>
          <TransformForm onSubmit={handleSubmit} onCancel={handleClose} />
        </DialogContent>
      </Dialog>
    </Paper>
  );
}

