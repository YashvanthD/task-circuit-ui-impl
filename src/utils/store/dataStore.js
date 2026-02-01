/**
 * Data Store - Centralized data management
 *
 * - Stores all data in snake_case format
 * - Handles parsing from both camelCase and snake_case
 * - Provides getters/setters for all entities
 * - Syncs with localStorage
 * - Emits events on changes
 *
 * @module utils/store/dataStore
 */

// ============================================================================
// Key Conversion Utilities
// ============================================================================

/**
 * Convert string from camelCase to snake_case
 */
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert string from snake_case to camelCase
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively convert object keys to snake_case
 * Handles nested objects and arrays
 */
function toSnakeCaseKeys(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();

  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCaseKeys(item));
  }

  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key);
    converted[snakeKey] = toSnakeCaseKeys(value);
  }
  return converted;
}

/**
 * Normalize data to snake_case - handles both camelCase and snake_case input
 * This is the main function to use when receiving data from any source
 */
function normalizeToSnakeCase(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();

  if (Array.isArray(obj)) {
    return obj.map(item => normalizeToSnakeCase(item));
  }

  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    // Convert camelCase keys to snake_case, leave snake_case as is
    const snakeKey = key.includes('_') ? key : toSnakeCase(key);
    converted[snakeKey] = normalizeToSnakeCase(value);
  }
  return converted;
}

// ============================================================================
// Field Extraction Helpers
// ============================================================================

/**
 * Get field value checking both snake_case and camelCase variants
 */
function getField(obj, snakeKey, defaultValue = null) {
  if (!obj) return defaultValue;

  // Try snake_case first (preferred)
  if (obj[snakeKey] !== undefined) return obj[snakeKey];

  // Try camelCase
  const camelKey = toCamelCase(snakeKey);
  if (obj[camelKey] !== undefined) return obj[camelKey];

  return defaultValue;
}

/**
 * Get ID field from various possible names
 */
function getId(obj, prefix) {
  if (!obj) return null;

  // Try common ID patterns
  const patterns = [
    `${prefix}_id`,      // task_id, notification_id
    `${prefix}Id`,       // taskId, notificationId
    'id',                // generic id
    '_id',               // MongoDB _id
  ];

  for (const pattern of patterns) {
    if (obj[pattern] !== undefined && obj[pattern] !== null) {
      return String(obj[pattern]);
    }
  }

  return null;
}

// ============================================================================
// Event Emitter
// ============================================================================

class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error('[DataStore] Event error:', e); }
      });
    }
  }
}

// ============================================================================
// Entity Normalizers
// ============================================================================

/**
 * Normalize a notification object to standard snake_case format
 */
function normalizeNotification(raw) {
  if (!raw) return null;

  const id = getId(raw, 'notification');
  if (!id) return null;

  return {
    notification_id: id,
    title: getField(raw, 'title', ''),
    message: getField(raw, 'message') || getField(raw, 'content') || getField(raw, 'body', ''),
    type: getField(raw, 'type', 'info'),
    priority: getField(raw, 'priority', 'normal'),
    read: !!(getField(raw, 'is_read') ?? getField(raw, 'read') ?? false),
    read_at: getField(raw, 'read_at'),
    user_key: getField(raw, 'user_key'),
    account_key: getField(raw, 'account_key'),
    entity_type: getField(raw, 'entity_type'),
    entity_id: getField(raw, 'entity_id'),
    action_url: getField(raw, 'action_url') || getField(raw, 'link'),
    metadata: getField(raw, 'metadata', {}),
    created_at: getField(raw, 'created_at') || new Date().toISOString(),
  };
}

/**
 * Normalize an alert object to standard snake_case format
 */
function normalizeAlert(raw) {
  if (!raw) return null;

  const id = getId(raw, 'alert');
  if (!id) return null;

  return {
    alert_id: id,
    title: getField(raw, 'title', ''),
    message: getField(raw, 'message') || getField(raw, 'description') || getField(raw, 'body', ''),
    type: getField(raw, 'type') || getField(raw, 'alert_type', 'warning'),
    severity: getField(raw, 'severity', 'medium'),
    status: getField(raw, 'status', 'active'),
    source: getField(raw, 'source', 'system'),
    source_id: getField(raw, 'source_id'),
    acknowledged: !!(getField(raw, 'acknowledged') ?? false),
    acknowledged_by: getField(raw, 'acknowledged_by'),
    acknowledged_at: getField(raw, 'acknowledged_at'),
    resolved: !!(getField(raw, 'resolved') ?? false),
    resolved_by: getField(raw, 'resolved_by'),
    resolved_at: getField(raw, 'resolved_at'),
    user_key: getField(raw, 'user_key'),
    account_key: getField(raw, 'account_key'),
    metadata: getField(raw, 'metadata', {}),
    created_at: getField(raw, 'created_at') || new Date().toISOString(),
    updated_at: getField(raw, 'updated_at'),
  };
}

/**
 * Normalize a task object to standard snake_case format
 */
function normalizeTask(raw) {
  if (!raw) return null;

  const id = getId(raw, 'task');
  if (!id) return null;

  return {
    task_id: id,
    title: getField(raw, 'title', ''),
    description: getField(raw, 'description', ''),
    status: getField(raw, 'status', 'pending'),
    priority: normalizePriority(getField(raw, 'priority', 'normal')),
    assigned_to: getField(raw, 'assigned_to'),
    assigned_by: getField(raw, 'assigned_by'),
    created_by: getField(raw, 'created_by'),
    due_date: getField(raw, 'due_date'),
    task_date: getField(raw, 'task_date'),
    task_type: getField(raw, 'task_type'),
    entity_type: getField(raw, 'entity_type'),
    entity_id: getField(raw, 'entity_id'),
    entity_name: getField(raw, 'entity_name'),
    account_key: getField(raw, 'account_key'),
    completed_at: getField(raw, 'completed_at'),
    completed_by: getField(raw, 'completed_by'),
    notes: getField(raw, 'notes', ''),
    metadata: getField(raw, 'metadata', {}),
    created_at: getField(raw, 'created_at') || new Date().toISOString(),
    updated_at: getField(raw, 'updated_at'),
  };
}

/**
 * Normalize priority to string format
 */
function normalizePriority(priority) {
  if (typeof priority === 'number') {
    if (priority <= 2) return 'low';
    if (priority >= 4) return 'high';
    return 'normal';
  }
  if (typeof priority === 'string') {
    const p = priority.toLowerCase();
    if (['low', 'normal', 'high', 'urgent', 'critical'].includes(p)) return p;
  }
  return 'normal';
}

/**
 * Normalize a user object to standard snake_case format
 */
function normalizeUser(raw) {
  if (!raw) return null;

  const id = getId(raw, 'user') || getField(raw, 'user_key');
  if (!id) return null;

  return {
    user_key: id,
    username: getField(raw, 'username') || getField(raw, 'user_name'),
    email: getField(raw, 'email'),
    display_name: getField(raw, 'display_name') || getField(raw, 'name') || getField(raw, 'full_name'),
    mobile: getField(raw, 'mobile') || getField(raw, 'phone'),
    role: getField(raw, 'role', 'user'),
    roles: getField(raw, 'roles') || (getField(raw, 'role') ? [getField(raw, 'role')] : ['user']),
    account_key: getField(raw, 'account_key'),
    active: getField(raw, 'active') !== false,
    profile_photo: getField(raw, 'profile_photo') || getField(raw, 'avatar') || getField(raw, 'avatar_url'),
    created_at: getField(raw, 'created_at'),
    updated_at: getField(raw, 'updated_at'),
    last_login_at: getField(raw, 'last_login_at'),
  };
}

/**
 * Normalize a message object to standard snake_case format
 */
function normalizeMessage(raw) {
  if (!raw) return null;

  const id = getId(raw, 'message');
  if (!id) return null;

  return {
    message_id: id,
    conversation_id: getField(raw, 'conversation_id'),
    content: getField(raw, 'content', ''),
    message_type: getField(raw, 'message_type') || getField(raw, 'type', 'text'),
    sender_key: getField(raw, 'sender_key') || getField(raw, 'sender'),
    sender_name: getField(raw, 'sender_name'),
    sender_avatar: getField(raw, 'sender_avatar'),
    receivers: getField(raw, 'receivers', []),
    status: getField(raw, 'status', 'sent'),
    delivered_to: getField(raw, 'delivered_to', []),
    read_by: getField(raw, 'read_by', []),
    is_delivered: !!(getField(raw, 'is_delivered') ?? false),
    is_read: !!(getField(raw, 'is_read') ?? false),
    delivered_at: getField(raw, 'delivered_at'),
    read_at: getField(raw, 'read_at'),
    reply_to: getField(raw, 'reply_to'),
    reactions: getField(raw, 'reactions', []),
    metadata: getField(raw, 'metadata', {}),
    created_at: getField(raw, 'created_at') || new Date().toISOString(),
    edited_at: getField(raw, 'edited_at'),
  };
}

/**
 * Normalize a conversation object to standard snake_case format
 */
function normalizeConversation(raw) {
  if (!raw) return null;

  const id = getId(raw, 'conversation');
  if (!id) return null;

  return {
    conversation_id: id,
    conversation_type: getField(raw, 'conversation_type') || getField(raw, 'type', 'direct'),
    name: getField(raw, 'name'),
    participants: getField(raw, 'participants', []),
    participants_info: getField(raw, 'participants_info', []),
    last_message: getField(raw, 'last_message') ? normalizeMessage(getField(raw, 'last_message')) : null,
    last_activity: getField(raw, 'last_activity'),
    unread_count: Number(getField(raw, 'unread_count', 0)),
    message_count: Number(getField(raw, 'message_count', 0)),
    is_muted: !!(getField(raw, 'is_muted') ?? false),
    is_pinned: !!(getField(raw, 'is_pinned') ?? false),
    is_archived: !!(getField(raw, 'is_archived') ?? false),
    created_at: getField(raw, 'created_at'),
    updated_at: getField(raw, 'updated_at'),
  };
}

/**
 * Normalize a pond object to standard snake_case format
 */
function normalizePond(raw) {
  if (!raw) return null;

  const id = getId(raw, 'pond');
  if (!id) return null;

  return {
    pond_id: id,
    name: getField(raw, 'name', ''),
    description: getField(raw, 'description', ''),
    location: getField(raw, 'location'),
    area: getField(raw, 'area'),
    depth: getField(raw, 'depth'),
    status: getField(raw, 'status', 'active'),
    farm_id: getField(raw, 'farm_id'),
    account_key: getField(raw, 'account_key'),
    water_quality: getField(raw, 'water_quality', {}),
    current_stock: getField(raw, 'current_stock', {}),
    metadata: getField(raw, 'metadata', {}),
    created_at: getField(raw, 'created_at'),
    updated_at: getField(raw, 'updated_at'),
  };
}

// ============================================================================
// Data Store Class
// ============================================================================

class DataStore {
  constructor() {
    this.events = new EventEmitter();
    this.data = {
      notifications: [],
      alerts: [],
      tasks: [],
      users: [],
      messages: new Map(), // conversation_id -> messages[]
      conversations: [],
      ponds: [],
      currentUser: null,
    };
    this.counts = {
      unreadNotifications: 0,
      unacknowledgedAlerts: 0,
      pendingTasks: 0,
      unreadMessages: 0,
    };
    this.loading = new Set();
    this.initialized = false;

    // Load from localStorage on init
    this._loadFromStorage();
  }

  // ==========================================================================
  // Storage
  // ==========================================================================

  _getStorageKey(entity) {
    return `tc_store_${entity}`;
  }

  _loadFromStorage() {
    try {
      // Load notifications
      const notifs = localStorage.getItem(this._getStorageKey('notifications'));
      if (notifs) this.data.notifications = JSON.parse(notifs);

      // Load alerts
      const alerts = localStorage.getItem(this._getStorageKey('alerts'));
      if (alerts) this.data.alerts = JSON.parse(alerts);

      // Load tasks
      const tasks = localStorage.getItem(this._getStorageKey('tasks'));
      if (tasks) this.data.tasks = JSON.parse(tasks);

      // Load users
      const users = localStorage.getItem(this._getStorageKey('users'));
      if (users) this.data.users = JSON.parse(users);

      // Load conversations
      const convos = localStorage.getItem(this._getStorageKey('conversations'));
      if (convos) this.data.conversations = JSON.parse(convos);

      // Load ponds
      const ponds = localStorage.getItem(this._getStorageKey('ponds'));
      if (ponds) this.data.ponds = JSON.parse(ponds);

      // Load current user
      const user = localStorage.getItem(this._getStorageKey('currentUser'));
      if (user) this.data.currentUser = JSON.parse(user);

      // Recompute counts
      this._updateCounts();

      this.initialized = true;
    } catch (e) {
      console.error('[DataStore] Failed to load from storage:', e);
    }
  }

  _saveToStorage(entity) {
    try {
      const key = this._getStorageKey(entity);
      const value = entity === 'messages'
        ? Object.fromEntries(this.data.messages)
        : this.data[entity];
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('[DataStore] Failed to save to storage:', e);
    }
  }

  _updateCounts() {
    this.counts.unreadNotifications = this.data.notifications.filter(n => !n.read).length;
    this.counts.unacknowledgedAlerts = this.data.alerts.filter(a => !a.acknowledged).length;
    this.counts.pendingTasks = this.data.tasks.filter(t => t.status === 'pending').length;

    let unreadMessages = 0;
    this.data.conversations.forEach(c => {
      unreadMessages += c.unread_count || 0;
    });
    this.counts.unreadMessages = unreadMessages;
  }

  // ==========================================================================
  // Notifications
  // ==========================================================================

  setNotifications(rawData) {
    const normalized = (Array.isArray(rawData) ? rawData : [])
      .map(n => normalizeNotification(n))
      .filter(Boolean);

    this.data.notifications = normalized;
    this._updateCounts();
    this._saveToStorage('notifications');
    this.events.emit('notifications', normalized);
    this.events.emit('counts', this.counts);
    return normalized;
  }

  getNotifications() {
    return this.data.notifications;
  }

  getNotificationById(id) {
    return this.data.notifications.find(n => n.notification_id === String(id));
  }

  getUnreadNotifications() {
    return this.data.notifications.filter(n => !n.read);
  }

  addNotification(raw) {
    const normalized = normalizeNotification(raw);
    if (!normalized) return null;

    // Remove existing if present
    this.data.notifications = this.data.notifications.filter(
      n => n.notification_id !== normalized.notification_id
    );

    // Add to beginning
    this.data.notifications.unshift(normalized);
    this._updateCounts();
    this._saveToStorage('notifications');
    this.events.emit('notifications', this.data.notifications);
    this.events.emit('notification:new', normalized);
    this.events.emit('counts', this.counts);
    return normalized;
  }

  markNotificationRead(id) {
    const notif = this.getNotificationById(id);
    if (notif && !notif.read) {
      notif.read = true;
      notif.read_at = new Date().toISOString();
      this._updateCounts();
      this._saveToStorage('notifications');
      this.events.emit('notifications', this.data.notifications);
      this.events.emit('notification:read', notif);
      this.events.emit('counts', this.counts);
    }
    return notif;
  }

  markAllNotificationsRead() {
    const now = new Date().toISOString();
    this.data.notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        n.read_at = now;
      }
    });
    this._updateCounts();
    this._saveToStorage('notifications');
    this.events.emit('notifications', this.data.notifications);
    this.events.emit('notifications:allRead');
    this.events.emit('counts', this.counts);
  }

  deleteNotification(id) {
    this.data.notifications = this.data.notifications.filter(
      n => n.notification_id !== String(id)
    );
    this._updateCounts();
    this._saveToStorage('notifications');
    this.events.emit('notifications', this.data.notifications);
    this.events.emit('notification:deleted', id);
    this.events.emit('counts', this.counts);
  }

  // ==========================================================================
  // Alerts
  // ==========================================================================

  setAlerts(rawData) {
    const normalized = (Array.isArray(rawData) ? rawData : [])
      .map(a => normalizeAlert(a))
      .filter(Boolean);

    this.data.alerts = normalized;
    this._updateCounts();
    this._saveToStorage('alerts');
    this.events.emit('alerts', normalized);
    this.events.emit('counts', this.counts);
    return normalized;
  }

  getAlerts() {
    return this.data.alerts;
  }

  getAlertById(id) {
    return this.data.alerts.find(a => a.alert_id === String(id));
  }

  getUnacknowledgedAlerts() {
    return this.data.alerts.filter(a => !a.acknowledged);
  }

  addAlert(raw) {
    const normalized = normalizeAlert(raw);
    if (!normalized) return null;

    this.data.alerts = this.data.alerts.filter(
      a => a.alert_id !== normalized.alert_id
    );

    this.data.alerts.unshift(normalized);
    this._updateCounts();
    this._saveToStorage('alerts');
    this.events.emit('alerts', this.data.alerts);
    this.events.emit('alert:new', normalized);
    this.events.emit('counts', this.counts);
    return normalized;
  }

  acknowledgeAlert(id, userKey) {
    const alert = this.getAlertById(id);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledged_at = new Date().toISOString();
      alert.acknowledged_by = userKey;
      this._updateCounts();
      this._saveToStorage('alerts');
      this.events.emit('alerts', this.data.alerts);
      this.events.emit('alert:acknowledged', alert);
      this.events.emit('counts', this.counts);
    }
    return alert;
  }

  deleteAlert(id) {
    this.data.alerts = this.data.alerts.filter(a => a.alert_id !== String(id));
    this._updateCounts();
    this._saveToStorage('alerts');
    this.events.emit('alerts', this.data.alerts);
    this.events.emit('alert:deleted', id);
    this.events.emit('counts', this.counts);
  }

  // ==========================================================================
  // Tasks
  // ==========================================================================

  setTasks(rawData) {
    const normalized = (Array.isArray(rawData) ? rawData : [])
      .map(t => normalizeTask(t))
      .filter(Boolean);

    this.data.tasks = normalized;
    this._updateCounts();
    this._saveToStorage('tasks');
    this.events.emit('tasks', normalized);
    this.events.emit('counts', this.counts);
    return normalized;
  }

  getTasks() {
    return this.data.tasks;
  }

  getTaskById(id) {
    return this.data.tasks.find(t => t.task_id === String(id));
  }

  getPendingTasks() {
    return this.data.tasks.filter(t => t.status === 'pending');
  }

  getCompletedTasks() {
    return this.data.tasks.filter(t => t.status === 'completed');
  }

  addTask(raw) {
    const normalized = normalizeTask(raw);
    if (!normalized) return null;

    this.data.tasks = this.data.tasks.filter(
      t => t.task_id !== normalized.task_id
    );

    this.data.tasks.unshift(normalized);
    this._updateCounts();
    this._saveToStorage('tasks');
    this.events.emit('tasks', this.data.tasks);
    this.events.emit('task:new', normalized);
    this.events.emit('counts', this.counts);
    return normalized;
  }

  updateTask(id, updates) {
    const task = this.getTaskById(id);
    if (task) {
      Object.assign(task, normalizeToSnakeCase(updates));
      task.updated_at = new Date().toISOString();
      this._updateCounts();
      this._saveToStorage('tasks');
      this.events.emit('tasks', this.data.tasks);
      this.events.emit('task:updated', task);
      this.events.emit('counts', this.counts);
    }
    return task;
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.task_id !== String(id));
    this._updateCounts();
    this._saveToStorage('tasks');
    this.events.emit('tasks', this.data.tasks);
    this.events.emit('task:deleted', id);
    this.events.emit('counts', this.counts);
  }

  // ==========================================================================
  // Users
  // ==========================================================================

  setUsers(rawData) {
    const normalized = (Array.isArray(rawData) ? rawData : [])
      .map(u => normalizeUser(u))
      .filter(Boolean);

    this.data.users = normalized;
    this._saveToStorage('users');
    this.events.emit('users', normalized);
    return normalized;
  }

  getUsers() {
    return this.data.users;
  }

  getUserByKey(userKey) {
    return this.data.users.find(u => u.user_key === String(userKey));
  }

  // ==========================================================================
  // Current User
  // ==========================================================================

  setCurrentUser(raw) {
    this.data.currentUser = raw ? normalizeUser(raw) : null;
    this._saveToStorage('currentUser');
    this.events.emit('currentUser', this.data.currentUser);
    return this.data.currentUser;
  }

  getCurrentUser() {
    return this.data.currentUser;
  }

  getCurrentUserKey() {
    return this.data.currentUser?.user_key || null;
  }

  // ==========================================================================
  // Messages & Conversations
  // ==========================================================================

  setConversations(rawData) {
    const normalized = (Array.isArray(rawData) ? rawData : [])
      .map(c => normalizeConversation(c))
      .filter(Boolean);

    this.data.conversations = normalized;
    this._updateCounts();
    this._saveToStorage('conversations');
    this.events.emit('conversations', normalized);
    this.events.emit('counts', this.counts);
    return normalized;
  }

  getConversations() {
    return this.data.conversations;
  }

  getConversationById(id) {
    return this.data.conversations.find(c => c.conversation_id === String(id));
  }

  setMessages(conversationId, rawData) {
    const normalized = (Array.isArray(rawData) ? rawData : [])
      .map(m => normalizeMessage(m))
      .filter(Boolean);

    this.data.messages.set(String(conversationId), normalized);
    this.events.emit(`messages:${conversationId}`, normalized);
    return normalized;
  }

  getMessages(conversationId) {
    return this.data.messages.get(String(conversationId)) || [];
  }

  addMessage(conversationId, raw) {
    const normalized = normalizeMessage(raw);
    if (!normalized) return null;

    const convId = String(conversationId);
    const messages = this.data.messages.get(convId) || [];

    // Remove existing if present
    const filtered = messages.filter(m => m.message_id !== normalized.message_id);
    filtered.push(normalized);

    // Sort by created_at
    filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    this.data.messages.set(convId, filtered);
    this.events.emit(`messages:${convId}`, filtered);
    this.events.emit('message:new', normalized);
    return normalized;
  }

  // ==========================================================================
  // Ponds
  // ==========================================================================

  setPonds(rawData) {
    const normalized = (Array.isArray(rawData) ? rawData : [])
      .map(p => normalizePond(p))
      .filter(Boolean);

    this.data.ponds = normalized;
    this._saveToStorage('ponds');
    this.events.emit('ponds', normalized);
    return normalized;
  }

  getPonds() {
    return this.data.ponds;
  }

  getPondById(id) {
    return this.data.ponds.find(p => p.pond_id === String(id));
  }

  // ==========================================================================
  // Counts & Stats
  // ==========================================================================

  getCounts() {
    return { ...this.counts };
  }

  getUnreadNotificationCount() {
    return this.counts.unreadNotifications;
  }

  getUnacknowledgedAlertCount() {
    return this.counts.unacknowledgedAlerts;
  }

  getPendingTaskCount() {
    return this.counts.pendingTasks;
  }

  getUnreadMessageCount() {
    return this.counts.unreadMessages;
  }

  // ==========================================================================
  // Events
  // ==========================================================================

  on(event, callback) {
    return this.events.on(event, callback);
  }

  off(event, callback) {
    this.events.off(event, callback);
  }

  // ==========================================================================
  // Clear
  // ==========================================================================

  clear() {
    this.data = {
      notifications: [],
      alerts: [],
      tasks: [],
      users: [],
      messages: new Map(),
      conversations: [],
      ponds: [],
      currentUser: null,
    };
    this.counts = {
      unreadNotifications: 0,
      unacknowledgedAlerts: 0,
      pendingTasks: 0,
      unreadMessages: 0,
    };

    // Clear storage
    ['notifications', 'alerts', 'tasks', 'users', 'conversations', 'ponds', 'currentUser']
      .forEach(key => localStorage.removeItem(this._getStorageKey(key)));

    this.events.emit('cleared');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const dataStore = new DataStore();

// ============================================================================
// Exports
// ============================================================================

export {
  dataStore,
  normalizeToSnakeCase,
  toSnakeCaseKeys,
  getField,
  getId,
  normalizeNotification,
  normalizeAlert,
  normalizeTask,
  normalizeUser,
  normalizeMessage,
  normalizeConversation,
  normalizePond,
};

export default dataStore;
