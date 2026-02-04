/**
 * Task Model Class
 * Represents a task entity with validation and normalization
 * Based on backend schema: references/entities/task.yaml
 *
 * @module models/Task
 */

import { BaseModel } from './BaseModel';

export class Task extends BaseModel {
  /**
   * Create a Task instance
   * @param {Object} data - Task data from backend (snake_case)
   */
  constructor(data = {}) {
    super(data);
  }

  _init(data) {
    // Primary fields
    this.task_id = data.task_id || data.taskId || data.id || data._id || null;
    this.title = data.title || '';
    this.description = data.description || '';

    // Assignment
    this.assigned_to = data.assigned_to || data.assignedTo || null;
    this.assigned_by = data.assigned_by || data.assignedBy || null;
    this.created_by = data.created_by || data.createdBy || null;

    // Status & Priority
    this.status = data.status || 'pending';
    this.priority = this._normalizePriority(data.priority);

    // Dates
    this.due_date = data.due_date || data.dueDate || data.end_date || data.endDate || data.endTime || null;
    this.task_date = data.task_date || data.taskDate || null;
    this.created_at = data.created_at || data.createdAt || null;
    this.updated_at = data.updated_at || data.updatedAt || null;
    this.completed_at = data.completed_at || data.completedAt || null;
    this.completed_by = data.completed_by || data.completedBy || null;

    // Entity relationship
    this.entity_type = data.entity_type || data.entityType || null;
    this.entity_id = data.entity_id || data.entityId || null;
    this.entity_name = data.entity_name || data.entityName || null;

    // Type & category
    this.task_type = data.task_type || data.taskType || null;
    this.account_key = data.account_key || data.accountKey || null;

    // Metadata
    this.metadata = data.metadata || {};
    this.notes = data.notes || '';
  }

  _normalizePriority(priority) {
    // Handle both numeric (1-5) and string (low/normal/high) formats
    if (typeof priority === 'number') {
      if (priority <= 2) return 'low';
      if (priority >= 4) return 'high';
      return 'normal';
    }
    if (typeof priority === 'string') {
      const p = priority.toLowerCase();
      if (['low', 'normal', 'high', 'urgent', 'critical'].includes(p)) {
        return p;
      }
    }
    return 'normal';
  }

  _validate() {
    if (!this.title || this.title.trim() === '') {
      this._addError('title', 'Title is required');
    }
    if (this.title && this.title.length > 200) {
      this._addError('title', 'Title must be less than 200 characters');
    }
    if (!['pending', 'inprogress', 'completed', 'cancelled'].includes(this.status)) {
      this._addError('status', 'Invalid status');
    }
  }

  /**
   * Check if task is overdue
   * @returns {boolean}
   */
  isOverdue() {
    if (!this.due_date || this.status === 'completed') return false;
    try {
      // Handle "empty string" or invalid dates
      const due = new Date(this.due_date.replace(' ', 'T'));
      if (isNaN(due.getTime())) return false;
      return due < new Date();
    } catch {
      return false;
    }
  }

  /**
   * Check if task is completed
   * @returns {boolean}
   */
  isCompleted() {
    return this.status === 'completed';
  }

  /**
   * Check if task is pending
   * @returns {boolean}
   */
  isPending() {
    return this.status === 'pending';
  }

  /**
   * Check if task is in progress
   * @returns {boolean}
   */
  isInProgress() {
    return this.status === 'inprogress';
  }

  /**
   * Get priority level as number (1-5)
   * @returns {number}
   */
  getPriorityLevel() {
    const map = {
      'low': 2,
      'normal': 3,
      'high': 4,
      'urgent': 5,
      'critical': 5
    };
    return map[this.priority] || 3;
  }

  /**
   * Get priority color
   * @returns {string}
   */
  getPriorityColor() {
    const map = {
      'low': '#9E9E9E',
      'normal': '#2196F3',
      'high': '#FF9800',
      'urgent': '#F44336',
      'critical': '#D32F2F'
    };
    return map[this.priority] || '#2196F3';
  }

  /**
   * Get status color
   * @returns {string}
   */
  getStatusColor() {
    const map = {
      'pending': '#FFC107',
      'inprogress': '#2196F3',
      'completed': '#4CAF50',
      'cancelled': '#9E9E9E'
    };
    return map[this.status] || '#9E9E9E';
  }

  /**
   * Mark task as completed
   * @param {string} completedBy - User key who completed the task
   * @returns {this}
   */
  markCompleted(completedBy) {
    this.status = 'completed';
    this.completed_at = new Date().toISOString();
    this.completed_by = completedBy;
    return this;
  }

  /**
   * Mark task as in progress
   * @returns {this}
   */
  markInProgress() {
    this.status = 'inprogress';
    return this;
  }

  /**
   * Cancel task
   * @returns {this}
   */
  cancel() {
    this.status = 'cancelled';
    return this;
  }
}

export default Task;
