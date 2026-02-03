/**
 * TaskForm Component
 * Form for creating and editing tasks.
 *
 * @module components/tasks/TaskForm
 */

import React, { useState, useEffect } from 'react';
import { FormContainer, FormSection, FormField, FormDropdown, FormActions } from '../common/forms';
import { Grid } from '@mui/material';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../constants';
import { apiFetch } from '../../api';
import { API_TASK } from '../../api/constants';
import { getPondOptions } from '../../utils/options';
import userUtil from '../../utils/user';

/**
 * TaskForm - Standardized task create/edit form
 */
export default function TaskForm({
  initialData = {},
  onSubmit,
  onCancel,
  users = [],
}) {
  const isEdit = !!initialData.task_id;

  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || 'normal',
    status: initialData.status || 'pending',
    assigned_to: initialData.assigned_to || '',
    due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().slice(0, 16) : '',
    entity_type: initialData.entity_type || '', // 'pond', 'farm', etc.
    entity_id: initialData.entity_id || '',
    task_type: initialData.task_type || '', // Added task_type
    notes: initialData.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const [userOptions, setUserOptions] = useState(users);
  const [entityOptions, setEntityOptions] = useState([]); // Dynamic options based on type

  useEffect(() => {
    // Load users if not provided
    if (userOptions.length === 0) {
      loadUsers();
    }
    // Load entity options if type is selected
    if (form.entity_type === 'pond') {
      loadPonds();
    }
  }, [form.entity_type, userOptions.length]);

  const loadUsers = async () => {
    try {
      const u = await userUtil.fetchUsers();
      setUserOptions(u || []);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  };

  const loadPonds = async () => {
    try {
      const ponds = await getPondOptions();
      setEntityOptions(ponds || []);
    } catch (e) {
      console.error('Failed to load ponds', e);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // Reset entity ID if type changes
    if (field === 'entity_type') {
      setForm(prev => ({ ...prev, entity_id: '' }));
      setEntityOptions([]);
      if (value === 'pond') loadPonds();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!form.title) {
        alert('Title is required');
        setLoading(false);
        return;
      }

      // If external submit handler provided
      if (onSubmit) {
        await onSubmit(form);
      } else {
        // Default API call
        const url = isEdit ? API_TASK.UPDATE(initialData.task_id) : API_TASK.CREATE;
        const method = isEdit ? 'PUT' : 'POST';

        await apiFetch(url, {
          method,
          body: JSON.stringify(form)
        });
      }
    } catch (error) {
      console.error('Task save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      title={isEdit ? 'Edit Task' : 'Create Task'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      <Grid container spacing={3}>
        <FormSection title="Task Details" subtitle="Basic information about the task">
          <FormField
            label="Title"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            required
            xs={12}
          />
          <FormField
            label="Description"
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            multiline
            rows={3}
            xs={12}
          />
        </FormSection>

        <FormSection title="Assignment & Scheduling" subtitle="Who and when">
          <FormDropdown
            label="Assign To"
            value={userOptions.find(u =>
              String(u.user_key) === String(form.assigned_to) ||
              String(u.userKey) === String(form.assigned_to) ||
              String(u.id) === String(form.assigned_to)
            ) || null}
            onChange={(e, val) => handleChange('assigned_to', val ? (val.user_key || val.userKey || val.id) : '')}
            options={userOptions}
            getOptionLabel={(opt) => opt.display_name || opt.username || opt.id || opt}
            xs={12} sm={6}
          />
          <FormDropdown
            label="Action Type"
            value={form.task_type}
            onChange={(e, val) => handleChange('task_type', val)}
            options={['feeding', 'sampling', 'harvest', 'maintenance', 'treatment', 'transfer', 'other']}
            xs={12} sm={6}
          />
          <FormField
            label="Due Date & Time"
            type="datetime-local"
            value={form.due_date}
            onChange={e => handleChange('due_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            xs={12} sm={6}
          />
          <FormDropdown
            label="Priority"
            value={form.priority}
            onChange={(e, val) => handleChange('priority', val)}
            options={PRIORITY_OPTIONS}
            xs={12} sm={6}
          />
          <FormDropdown
            label="Status"
            value={form.status}
            onChange={(e, val) => handleChange('status', val)}
            options={STATUS_OPTIONS}
            getOptionLabel={opt => opt.label || opt}
            valueKey="value" // Assuming STATUS_OPTIONS are objects
            xs={12} sm={6}
          />
        </FormSection>

        <FormSection title="Related Entity" subtitle="Link task to specific item">
          <FormDropdown
            label="Related To"
            value={form.entity_type}
            onChange={(e, val) => handleChange('entity_type', val)}
            options={['pond', 'farm', 'equipment']} // Can be moved to constants
            xs={12} sm={6}
          />
          {form.entity_type === 'pond' && (
            <FormDropdown
              label="Select Pond"
              value={form.entity_id}
              onChange={(e, val) => handleChange('entity_id', val)}
              options={entityOptions}
              getOptionLabel={opt => opt.label || opt.name}
              valueKey="id"
              loading={entityOptions.length === 0}
              xs={12} sm={6}
            />
          )}
        </FormSection>

        <FormActions
          submitText={isEdit ? 'Update Task' : 'Create Task'}
          onCancel={onCancel}
          loading={loading}
        />
      </Grid>
    </FormContainer>
  );
}
