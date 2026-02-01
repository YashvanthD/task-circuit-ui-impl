/**
 * Alert Model Class
 * Represents a system alert entity with validation and normalization
 * Based on backend schema: references/entities/alert.yaml
 *
 * @module models/Alert
 */

import { BaseModel } from './BaseModel';

export class Alert extends BaseModel {
  /**
   * Create an Alert instance
   * @param {Object} data - Alert data from backend (snake_case)
   */
  constructor(data = {}) {
    super(data);
  }

  _init(data) {
    // Primary fields
    this.alert_id = data.alert_id || data.alertId || data.id || null;
    this.title = data.title || '';
    this.message = data.message || data.description || '';

    // Type & Severity
    this.type = data.type || 'warning'; // info, success, warning, error, critical
    this.severity = data.severity || 'medium'; // low, medium, high, critical

    // Source
    this.source = data.source || 'system'; // system, pond, task, expense
    this.source_id = data.source_id || data.sourceId || null;

    // Status
    this.status = data.status || 'active'; // active, resolved, deleted
    this.acknowledged = data.acknowledged || false;
    this.acknowledged_at = data.acknowledged_at || data.acknowledgedAt || null;
    this.acknowledged_by = data.acknowledged_by || data.acknowledgedBy || null;
    this.resolved_at = data.resolved_at || data.resolvedAt || null;
    this.resolved_by = data.resolved_by || data.resolvedBy || null;

    // Recipients
    this.user_key = data.user_key || data.userKey || null;

    // Data payload
    this.data = data.data || {};

    // Timestamps
    this.created_at = data.created_at || data.createdAt || new Date().toISOString();
    this.updated_at = data.updated_at || data.updatedAt || null;

    // Metadata
    this.metadata = data.metadata || {};
  }

  _validate() {
    if (!this.alert_id) {
      this._addError('alert_id', 'Alert ID is required');
    }
    if (!this.title || this.title.trim() === '') {
      this._addError('title', 'Title is required');
    }
    if (!['info', 'success', 'warning', 'error', 'critical'].includes(this.type)) {
      this._addError('type', 'Invalid alert type');
    }
    if (!['low', 'medium', 'high', 'critical'].includes(this.severity)) {
      this._addError('severity', 'Invalid severity level');
    }
  }

  /**
   * Check if alert is unacknowledged
   * @returns {boolean}
   */
  isUnacknowledged() {
    return !this.acknowledged;
  }

  /**
   * Check if alert is acknowledged
   * @returns {boolean}
   */
  isAcknowledged() {
    return this.acknowledged;
  }

  /**
   * Check if alert is resolved
   * @returns {boolean}
   */
  isResolved() {
    return this.status === 'resolved' || this.resolved_at !== null;
  }

  /**
   * Check if alert is active
   * @returns {boolean}
   */
  isActive() {
    return this.status === 'active' && !this.isResolved();
  }

  /**
   * Mark as acknowledged
   * @param {string} userKey - User who acknowledged
   * @returns {this}
   */
  acknowledge(userKey) {
    this.acknowledged = true;
    this.acknowledged_at = new Date().toISOString();
    this.acknowledged_by = userKey;
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
    return map[this.type] || 'warning';
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
    return map[this.type] || '#FF9800';
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
    return map[this.type] || '#FFF3E0';
  }

  /**
   * Get severity color
   * @returns {string}
   */
  getSeverityColor() {
    const map = {
      'low': '#9E9E9E',
      'medium': '#FF9800',
      'high': '#F44336',
      'critical': '#D32F2F'
    };
    return map[this.severity] || '#FF9800';
  }

  /**
   * Get severity level as number (1-4)
   * @returns {number}
   */
  getSeverityLevel() {
    const map = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };
    return map[this.severity] || 2;
  }

  /**
   * Get source icon
   * @returns {string}
   */
  getSourceIcon() {
    const map = {
      'system': 'settings',
      'pond': 'water_drop',
      'task': 'assignment',
      'expense': 'account_balance'
    };
    return map[this.source] || 'settings';
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

export default Alert;
