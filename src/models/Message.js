/**
 * Message Model Class
 * Represents a chat message entity with validation and normalization
 * Based on backend schema: references/entities/chat.yaml
 *
 * @module models/Message
 */

import { BaseModel } from './BaseModel';

export class Message extends BaseModel {
  /**
   * Create a Message instance
   * @param {Object} data - Message data from backend (snake_case)
   */
  constructor(data = {}) {
    super(data);
  }

  _init(data) {
    // Primary fields
    this.message_id = data.message_id || data.messageId || data.id || null;
    this.conversation_id = data.conversation_id || data.conversationId || null;
    this.content = data.content || '';
    this.message_type = data.message_type || data.type || 'text';

    // Sender & Receivers
    this.sender_key = data.sender_key || data.senderKey || data.sender || null;
    this.sender_name = data.sender_name || data.senderName || null;
    this.sender_avatar = data.sender_avatar || data.senderAvatar || null;
    this.receivers = data.receivers || [];

    // Status tracking
    this.status = data.status || 'sent'; // sending, sent, delivered, read, failed
    this.delivered_to = data.delivered_to || data.deliveredTo || [];
    this.read_by = data.read_by || data.readBy || [];
    this.is_delivered = data.is_delivered || false;
    this.is_read = data.is_read || false;

    // Timestamps
    this.created_at = data.created_at || data.createdAt || new Date().toISOString();
    this.delivered_at = data.delivered_at || data.deliveredAt || null;
    this.read_at = data.read_at || data.readAt || null;
    this.edited_at = data.edited_at || data.editedAt || null;

    // Reply & Reactions
    this.reply_to = data.reply_to || data.replyTo || null;
    this.reactions = data.reactions || [];

    // Metadata
    this.metadata = data.metadata || {};
  }

  _validate() {
    if (!this.message_id) {
      this._addError('message_id', 'Message ID is required');
    }
    if (!this.conversation_id) {
      this._addError('conversation_id', 'Conversation ID is required');
    }
    if (!this.content || this.content.trim() === '') {
      this._addError('content', 'Content is required');
    }
    if (!this.sender_key) {
      this._addError('sender_key', 'Sender key is required');
    }
  }

  /**
   * Check if message is from current user
   * @param {string} currentUserKey - Current user's key
   * @returns {boolean}
   */
  isOwn(currentUserKey) {
    return this.sender_key === currentUserKey;
  }

  /**
   * Check if message is incoming
   * @param {string} currentUserKey - Current user's key
   * @returns {boolean}
   */
  isIncoming(currentUserKey) {
    return !this.isOwn(currentUserKey);
  }

  /**
   * Check if message is sending
   * @returns {boolean}
   */
  isSending() {
    return this.status === 'sending';
  }

  /**
   * Check if message is sent
   * @returns {boolean}
   */
  isSent() {
    return this.status === 'sent';
  }

  /**
   * Check if message is delivered
   * @returns {boolean}
   */
  isDelivered() {
    return this.status === 'delivered' || this.is_delivered;
  }

  /**
   * Check if message is read
   * @returns {boolean}
   */
  isRead() {
    return this.status === 'read' || this.is_read;
  }

  /**
   * Check if message failed
   * @returns {boolean}
   */
  isFailed() {
    return this.status === 'failed';
  }

  /**
   * Check if message is delivered to all receivers
   * @returns {boolean}
   */
  isDeliveredToAll() {
    if (this.receivers.length === 0) return false;
    return this.receivers.every(r => this.delivered_to.includes(r));
  }

  /**
   * Check if message is read by all receivers
   * @returns {boolean}
   */
  isReadByAll() {
    if (this.receivers.length === 0) return false;
    return this.receivers.every(r => this.read_by.includes(r));
  }

  /**
   * Get status icon name
   * @returns {string}
   */
  getStatusIcon() {
    const map = {
      'sending': 'schedule',
      'sent': 'done',
      'delivered': 'done_all',
      'read': 'done_all',
      'failed': 'error'
    };
    return map[this.status] || 'done';
  }

  /**
   * Get status color
   * @returns {string}
   */
  getStatusColor() {
    if (this.status === 'read') return '#53bdeb'; // Blue tick (WhatsApp style)
    if (this.status === 'failed') return '#f44336';
    return 'rgba(0,0,0,0.4)'; // Gray
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

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
  }

  /**
   * Mark as delivered to a user
   * @param {string} userKey - User key
   * @returns {this}
   */
  markDeliveredTo(userKey) {
    if (!this.delivered_to.includes(userKey)) {
      this.delivered_to.push(userKey);
    }
    if (this.isDeliveredToAll()) {
      this.status = 'delivered';
      this.is_delivered = true;
      this.delivered_at = new Date().toISOString();
    }
    return this;
  }

  /**
   * Mark as read by a user
   * @param {string} userKey - User key
   * @returns {this}
   */
  markReadBy(userKey) {
    if (!this.read_by.includes(userKey)) {
      this.read_by.push(userKey);
    }
    // Also mark as delivered
    this.markDeliveredTo(userKey);

    if (this.isReadByAll()) {
      this.status = 'read';
      this.is_read = true;
      this.read_at = new Date().toISOString();
    }
    return this;
  }

  /**
   * Add reaction to message
   * @param {string} emoji - Emoji reaction
   * @param {string} userKey - User who reacted
   * @returns {this}
   */
  addReaction(emoji, userKey) {
    const existing = this.reactions.find(r => r.emoji === emoji);
    if (existing) {
      if (!existing.users.includes(userKey)) {
        existing.users.push(userKey);
        existing.count++;
      }
    } else {
      this.reactions.push({ emoji, users: [userKey], count: 1 });
    }
    return this;
  }
}

export default Message;
