/**
 * Conversation Model Class
 * Represents a chat conversation entity with validation and normalization
 * Based on backend schema: references/entities/chat.yaml
 *
 * @module models/Conversation
 */

import { BaseModel } from './BaseModel';

export class Conversation extends BaseModel {
  /**
   * Create a Conversation instance
   * @param {Object} data - Conversation data from backend (snake_case)
   */
  constructor(data = {}) {
    super(data);
  }

  _init(data) {
    // Primary fields
    this.conversation_id = data.conversation_id || data.conversationId || data.id || null;
    this.conversation_type = data.conversation_type || data.type || 'direct';
    this.name = data.name || null;

    // Participants
    this.participants = data.participants || [];
    this.participants_info = data.participants_info || data.participantsInfo || [];

    // Last message
    this.last_message = data.last_message || data.lastMessage || null;
    this.last_activity = data.last_activity || data.lastActivity || null;

    // Counts
    this.unread_count = Number(data.unread_count || data.unreadCount) || 0;
    this.message_count = Number(data.message_count || data.messageCount) || 0;

    // Settings
    this.is_muted = data.is_muted || data.isMuted || false;
    this.is_pinned = data.is_pinned || data.isPinned || false;
    this.is_archived = data.is_archived || data.isArchived || false;

    // Timestamps
    this.created_at = data.created_at || data.createdAt || null;
    this.updated_at = data.updated_at || data.updatedAt || null;

    // Metadata
    this.metadata = data.metadata || {};
  }

  _validate() {
    if (!this.conversation_id) {
      this._addError('conversation_id', 'Conversation ID is required');
    }
    if (!['direct', 'group'].includes(this.conversation_type)) {
      this._addError('conversation_type', 'Invalid conversation type');
    }
    if (!this.participants || this.participants.length === 0) {
      this._addError('participants', 'Participants are required');
    }
  }

  /**
   * Check if conversation is direct (1-on-1)
   * @returns {boolean}
   */
  isDirect() {
    return this.conversation_type === 'direct';
  }

  /**
   * Check if conversation is group
   * @returns {boolean}
   */
  isGroup() {
    return this.conversation_type === 'group';
  }

  /**
   * Check if conversation has unread messages
   * @returns {boolean}
   */
  hasUnread() {
    return this.unread_count > 0;
  }

  /**
   * Check if conversation is muted
   * @returns {boolean}
   */
  isMuted() {
    return this.is_muted;
  }

  /**
   * Check if conversation is pinned
   * @returns {boolean}
   */
  isPinned() {
    return this.is_pinned;
  }

  /**
   * Check if conversation is archived
   * @returns {boolean}
   */
  isArchived() {
    return this.is_archived;
  }

  /**
   * Get other participant (for direct conversations)
   * @param {string} currentUserKey - Current user's key
   * @returns {string|null}
   */
  getOtherParticipant(currentUserKey) {
    if (!this.isDirect()) return null;
    return this.participants.find(p => p !== currentUserKey) || null;
  }

  /**
   * Get other participant info (for direct conversations)
   * @param {string} currentUserKey - Current user's key
   * @returns {Object|null}
   */
  getOtherParticipantInfo(currentUserKey) {
    if (!this.isDirect()) return null;
    return this.participants_info.find(p => p.user_key !== currentUserKey) || null;
  }

  /**
   * Get display name for conversation
   * @param {string} currentUserKey - Current user's key
   * @returns {string}
   */
  getDisplayName(currentUserKey) {
    if (this.isGroup()) {
      return this.name || 'Group Chat';
    }

    // For direct chat, show other participant's name
    const otherParticipant = this.getOtherParticipantInfo(currentUserKey);
    if (otherParticipant) {
      return otherParticipant.name || otherParticipant.username || otherParticipant.user_key;
    }

    return 'Unknown';
  }

  /**
   * Get avatar URL for conversation
   * @param {string} currentUserKey - Current user's key
   * @returns {string|null}
   */
  getAvatarUrl(currentUserKey) {
    if (this.isGroup()) {
      return null; // Groups typically use a group icon
    }

    const otherParticipant = this.getOtherParticipantInfo(currentUserKey);
    return otherParticipant?.avatar_url || otherParticipant?.profile_photo || null;
  }

  /**
   * Check if other user is online (for direct chats)
   * @param {string} currentUserKey - Current user's key
   * @returns {boolean}
   */
  isOtherUserOnline(currentUserKey) {
    if (!this.isDirect()) return false;
    const otherParticipant = this.getOtherParticipantInfo(currentUserKey);
    return otherParticipant?.is_online || false;
  }

  /**
   * Get last message preview text
   * @returns {string}
   */
  getLastMessagePreview() {
    if (!this.last_message) return 'No messages yet';

    const content = this.last_message.content || '';
    const maxLength = 40;

    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  }

  /**
   * Get last activity time string
   * @returns {string}
   */
  getLastActivityTime() {
    const timestamp = this.last_activity || this.last_message?.created_at || this.updated_at;
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  }

  /**
   * Pin conversation
   * @returns {this}
   */
  pin() {
    this.is_pinned = true;
    return this;
  }

  /**
   * Unpin conversation
   * @returns {this}
   */
  unpin() {
    this.is_pinned = false;
    return this;
  }

  /**
   * Mute conversation
   * @returns {this}
   */
  mute() {
    this.is_muted = true;
    return this;
  }

  /**
   * Unmute conversation
   * @returns {this}
   */
  unmute() {
    this.is_muted = false;
    return this;
  }

  /**
   * Archive conversation
   * @returns {this}
   */
  archive() {
    this.is_archived = true;
    return this;
  }

  /**
   * Unarchive conversation
   * @returns {this}
   */
  unarchive() {
    this.is_archived = false;
    return this;
  }

  /**
   * Clear unread count
   * @returns {this}
   */
  clearUnread() {
    this.unread_count = 0;
    return this;
  }
}

export default Conversation;
