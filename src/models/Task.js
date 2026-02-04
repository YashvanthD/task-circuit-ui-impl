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

  static get schema() {
    return {
      task_id: { type: 'string', aliases: ['taskId', 'id', '_id'] },
      title: {
        type: 'string',
        required: true,
        default: '',
        validate: (val) => val && val.trim() !== '' && val.length <= 200,
        errorMessage: 'Title is required and must be < 200 chars'
      },
      description: { type: 'string', default: '' },
      assigned_to: { type: 'string', aliases: ['assignedTo'] },
      assigned_by: { type: 'string', aliases: ['assignedBy'] },
      created_by: { type: 'string', aliases: ['createdBy'] },
      status: {
        type: 'string',
        default: 'pending',
        validate: (val) => ['pending', 'inprogress', 'completed', 'cancelled'].includes(val),
        errorMessage: 'Invalid status'
      },
      priority: {
        type: 'string',
        parse: (val) => Task.normalizePriority(val)
      },
      due_date: { type: 'string', aliases: ['dueDate', 'end_date', 'endDate', 'endTime'] },
      task_date: { type: 'string', aliases: ['taskDate'] },
      created_at: { type: 'string', aliases: ['createdAt'] },
      updated_at: { type: 'string', aliases: ['updatedAt'] },
      completed_at: { type: 'string', aliases: ['completedAt'] },
      completed_by: { type: 'string', aliases: ['completedBy'] },

      entity_type: { type: 'string', aliases: ['entityType'] },
      entity_id: { type: 'string', aliases: ['entityId'] },
      entity_name: { type: 'string', aliases: ['entityName'] },

      task_type: { type: 'string', aliases: ['taskType'] },
      account_key: { type: 'string', aliases: ['accountKey'] },
      metadata: { type: 'object', default: {} },
      notes: { type: 'string', default: '' },
    };
  }

  static normalizePriority(priority) {
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

  // Backward compatibility wrapper
  _normalizePriority(p) { return Task.normalizePriority(p); }

  _validate() {
    super._validate();
    // Additional complex validation if needed
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
