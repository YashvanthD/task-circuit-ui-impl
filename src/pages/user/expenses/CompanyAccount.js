import React, { useEffect, useState } from 'react';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Card,
    CardContent,
    IconButton,
    Dialog
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OrganizationTree from '../../../components/OrganizationTree';
import { getDummyOrgTree, getUserAnalytics, formatCurrency } from '../../../utils/expenses';
import EditIcon from '@mui/icons-material/Edit';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'company_account_details';
function loadAccount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { companyName: 'Company Name', accountNumber: '', ifsc: '', bankName: '', branch: '', accountType: 'Current' };
  } catch (e) { return { companyName: 'Company Name', accountNumber: '', ifsc: '', bankName: '', branch: '', accountType: 'Current' }; }
}

export default function CompanyAccount() {
  const [account, setAccount] = useState(loadAccount());
  const [filter, setFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [tree, setTree] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(loadAccount());
  const navigate = useNavigate();

  useEffect(() => {
    setAccount(loadAccount());
    setTree(getDummyOrgTree());
  }, []);

  useEffect(() => {
    setForm(loadAccount());
  }, [account]);

  const onSelectNode = (node) => {
    setSelectedUser(node);
    setPopupOpen(true);
  };

  const openEdit = () => {
    setForm(loadAccount());
    setEditOpen(true);
  };
  const closeEdit = () => setEditOpen(false);
  const saveEdit = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setAccount(form);
    setEditOpen(false);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5">{account.companyName} Account</Typography>
          <Typography variant="body2" color="text.secondary">Company bank details and organization analytics.</Typography>
        </Box>
        <IconButton aria-label="edit" onClick={openEdit}><EditIcon /></IconButton>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Account Number</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{account.accountNumber || '—'}</Typography>
        <Typography variant="subtitle2" sx={{ mt: 1 }}>Account Type</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{account.accountType || '—'}</Typography>
        <Typography variant="subtitle2" sx={{ mt: 1 }}>Bank</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{account.bankName || '—'}</Typography>
        <Typography variant="subtitle2" sx={{ mt: 1 }}>Branch / IFSC</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{account.branch || '—'} {account.ifsc ? `• ${account.ifsc}` : ''}</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box sx={{ width: { xs: '100%', md: '40%' } }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                <TextField size="small" placeholder="Search user" value={filter} onChange={(e)=>setFilter(e.target.value)} fullWidth />
                <IconButton size="small" aria-label="search" onClick={() => { /* noop - filter applied live */ }}><SearchIcon /></IconButton>
                <Button variant="text" onClick={() => setFilter('')}>Clear</Button>
              </Box>
              <Box sx={{ maxHeight: 420, overflow: 'auto' }}>
                <OrganizationTree treeData={tree} filter={filter} onSelect={onSelectNode} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: { xs: '100%', md: '60%' } }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Selected User</Typography>
              {selectedUser ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedUser.name}</Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Title</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedUser.title || '—'}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Analytics</Typography>
                    <Typography>Total spent: ₹{formatCurrency(getUserAnalytics(selectedUser.id).totalSpent)}</Typography>
                    <Typography>Tasks: {getUserAnalytics(selectedUser.id).tasks}</Typography>
                    <Typography>Last active: {getUserAnalytics(selectedUser.id).lastActive}</Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Select a user from the organization tree to view analytics.</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Dialog open={popupOpen} onClose={() => setPopupOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Selected User</DialogTitle>
        <DialogContent>
          {selectedUser ? (
            <Box>
              <Typography variant="subtitle2">Name</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedUser.name}</Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Title</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedUser.title || '—'}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Analytics</Typography>
                <Typography>Total spent: ₹{formatCurrency(getUserAnalytics(selectedUser.id).totalSpent)}</Typography>
                <Typography>Tasks: {getUserAnalytics(selectedUser.id).tasks}</Typography>
                <Typography>Last active: {getUserAnalytics(selectedUser.id).lastActive}</Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPopupOpen(false)}>Close</Button>
          {selectedUser && <Button variant="contained" onClick={() => { setPopupOpen(false); navigate(`/taskcircuit/user/tree-user/${selectedUser.id}`); }}>Open Profile</Button>}
        </DialogActions>
      </Dialog>

      {/* Edit company account dialog */}
      <Dialog open={editOpen} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Update Company Account</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField label="Company Name" value={form.companyName} onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))} />
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
