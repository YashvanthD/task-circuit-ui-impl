/**
 * Notification Model Class
 * Represents a notification entity with validation and normalization
 * Based on backend schema: references/entities/notification.yaml
 *
 * @module models/Notification
 */

import { BaseModel } from './BaseModel';

export class Notification extends BaseModel {
  /**
   * Create a Notification instance
   * @param {Object} data - Notification data from backend (snake_case)
   */
  constructor(data = {}) {
    super(data);
  }

  _init(data) {
    // Primary fields
    this.notification_id = data.notification_id || data.notificationId || data.id || null;
    this.title = data.title || '';
    this.message = data.message || data.content || '';

    // Type & Priority
    this.type = data.type || 'info'; // info, success, warning, error, critical
    this.priority = data.priority || 'normal'; // low, normal, high

    // Status - Backend sends is_read, normalize to read
    // Use explicit check since false || true would be true
    this.read = data.is_read !== undefined ? !!data.is_read : (data.read !== undefined ? !!data.read : false);
    this.read_at = data.read_at || data.readAt || null;

    // Recipient
    this.user_key = data.user_key || data.userKey || null;

    // Sender (optional)
    this.sender_key = data.sender_key || data.senderKey || null;
    this.sender_name = data.sender_name || data.senderName || null;

    // Link & Action
    this.link = data.link || data.url || null;
    this.action = data.action || null;

    // Data payload
    this.data = data.data || {};

    // Timestamps
    this.created_at = data.created_at || data.createdAt || new Date().toISOString();

    // Metadata
    this.metadata = data.metadata || {};
  }

  _validate() {
    if (!this.notification_id) {
      this._addError('notification_id', 'Notification ID is required');
    }
    if (!this.title || this.title.trim() === '') {
      this._addError('title', 'Title is required');
    }
    if (!['info', 'success', 'warning', 'error', 'critical'].includes(this.type)) {
      this._addError('type', 'Invalid notification type');
    }
  }

  /**
   * Check if notification is unread
   * @returns {boolean}
   */
  isUnread() {
    return !this.read;
  }

  /**
   * Check if notification is read
   * @returns {boolean}
   */
  isRead() {
    return this.read;
  }

  /**
   * Mark as read
   * @returns {this}
   */
  markAsRead() {
    this.read = true;
    this.read_at = new Date().toISOString();
    return this;
  }

  /**
   * Get type icon
   * @returns {string}
   */
  getTypeIcon() {
    const map = {
      'info': 'info',
      'success': 'check_circle',
      'warning': 'warning',
      'error': 'error',
      'critical': 'error'
    };
    return map[this.type] || 'info';
  }

  /**
   * Get type color
   * @returns {string}
   */
  getTypeColor() {
    const map = {
      'info': '#2196F3',
      'success': '#4CAF50',
      'warning': '#FF9800',
      'error': '#F44336',
      'critical': '#D32F2F'
    };
    return map[this.type] || '#2196F3';
  }

  /**
   * Get type background color
   * @returns {string}
   */
  getTypeBgColor() {
    const map = {
      'info': '#E3F2FD',
      'success': '#E8F5E9',
      'warning': '#FFF3E0',
      'error': '#FFEBEE',
      'critical': '#FFCDD2'
    };
    return map[this.type] || '#E3F2FD';
  }

  /**
   * Get priority color
   * @returns {string}
   */
  getPriorityColor() {
    const map = {
      'low': '#9E9E9E',
      'normal': '#2196F3',
      'high': '#FF9800'
    };
    return map[this.priority] || '#2196F3';
  }

  /**
   * Get time ago string
   * @returns {string}
   */
  getTimeAgo() {
    if (!this.created_at) return '';
    const now = new Date();
    const created = new Date(this.created_at);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString();
  }
}

export default Notification;
