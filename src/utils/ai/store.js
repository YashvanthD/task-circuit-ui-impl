/**
 * AI Store
 * Manages the state of the AI Assistant conversation.
 * Syncs between Roaming Assistant and AI Page.
 *
 * @module utils/ai/store
 */

import { EventEmitter } from 'events';

// Config
const STORAGE_KEY = 'tc_ai_conversation';
const MAX_HISTORY = 50;

// Events
export const AI_EVENTS = {
  MESSAGE_ADDED: 'message_added',
  CLEARED: 'cleared',
  UPDATED: 'updated',
};

class AIStore extends EventEmitter {
  constructor() {
    super();
    this.messages = this._loadMessages();
  }

  /**
   * Load messages from localStorage
   * @private
   */
  _loadMessages() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load AI history', e);
    }

    // Default welcome message
    return [{
      message_id: 'init-1',
      sender_key: 'ai-assistant',
      role: 'assistant', // normalized role
      content: 'Hello! I am your AI assistant. How can I help you today?',
      created_at: new Date().toISOString(),
      status: 'read'
    }];
  }

  /**
   * Save messages to localStorage
   * @private
   */
  _saveMessages() {
    try {
      // Limit history
      const toSave = this.messages.slice(-MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save AI history', e);
    }
  }

  /**
   * Get all messages
   */
  getMessages() {
    return [...this.messages];
  }

  /**
   * Add a user message
   * @param {string} text
   * @param {Array} attachments
   */
  addUserMessage(text, attachments = []) {
    const msg = {
      message_id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender_key: 'current_user', // Placeholder
      role: 'user',
      content: text,
      attachments: attachments,
      created_at: new Date().toISOString(),
      status: 'sent'
    };

    this.messages.push(msg);
    this._saveMessages();
    this.emit(AI_EVENTS.MESSAGE_ADDED, msg);
    this.emit(AI_EVENTS.UPDATED, this.messages);

    return msg;
  }

  /**
   * Add an assistant message
   * @param {string} text
   */
  addAssistantMessage(text) {
    const msg = {
      message_id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender_key: 'ai-assistant',
      role: 'assistant',
      content: text,
      created_at: new Date().toISOString(),
      status: 'read'
    };

    this.messages.push(msg);
    this._saveMessages();
    this.emit(AI_EVENTS.MESSAGE_ADDED, msg);
    this.emit(AI_EVENTS.UPDATED, this.messages);

    return msg;
  }

  /**
   * Clear conversation history
   */
  clear() {
    this.messages = [{
      message_id: `init-${Date.now()}`,
      sender_key: 'ai-assistant',
      role: 'assistant',
      content: 'Conversation history cleared. How can I help you now?',
      created_at: new Date().toISOString(),
      status: 'read'
    }];
    this._saveMessages();
    this.emit(AI_EVENTS.CLEARED);
    this.emit(AI_EVENTS.UPDATED, this.messages);
  }
}

// Singleton instance
export const aiStore = new AIStore();
