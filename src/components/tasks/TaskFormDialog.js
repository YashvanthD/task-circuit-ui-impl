/**
 * TaskFormDialog Component
 * Dialog for creating and editing tasks.
 *
 * @module components/tasks/TaskFormDialog
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  Button,
  Typography,
} from '@mui/material';

import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../constants';

/**
 * TaskFormDialog - Reusable dialog for task creation and editing.
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.form - Form state
 * @param {Function} props.onChange - Form change handler
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Array} props.userOptions - List of users for assignment
 * @param {Object} props.selfUser - Current user object
 * @param {string} props.error - Error message
 * @param {Function} props.onDelete - Delete handler (optional)
 */
export default function TaskFormDialog({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  userOptions = [],
  selfUser,
  error,
  onDelete,
}) {
  const isEdit = !!form.task_id;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Task' : 'Create Task'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label={
                <span>
                  Title <span style={{ color: 'red' }}>*</span>
                </span>
              }
              name="title"
              value={form.title}
              onChange={onChange}
              required
              fullWidth
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={onChange}
              multiline
              rows={2}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={form.status} label="Status" onChange={onChange}>
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select name="priority" value={form.priority} label="Priority" onChange={onChange}>
                {PRIORITY_OPTIONS.map((p) => (
                  <MenuItem key={p} value={String(p)}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Assigned To *</InputLabel>
              <Select
                name="assigned_to"
                value={form.assigned_to}
                label="Assigned To *"
                onChange={onChange}
                required
              >
                {userOptions.map((u) => (
                  <MenuItem key={u.user_key} value={u.user_key}>
                    {u.username || u.user_key}
                    {selfUser?.user_key === u.user_key ? ' (You)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={
                <span>
                  End Date (YYYY-MM-DD) <span style={{ color: 'red' }}>*</span>
                </span>
              }
              name="end_date"
              value={form.end_date}
              onChange={onChange}
              required
              fullWidth
            />
            <TextField
              label="Task Date (YYYY-MM-DD)"
              name="task_date"
              value={form.task_date}
              onChange={onChange}
              fullWidth
            />
            <TextField
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={onChange}
              multiline
              rows={2}
              fullWidth
            />
            {error && <Typography color="error">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          {isEdit && onDelete && (
            <Button onClick={onDelete} variant="contained" color="error" sx={{ mr: 'auto' }}>
              Delete
            </Button>
          )}
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

