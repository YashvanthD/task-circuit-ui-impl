/**
 * Notifications & Alerts API Module
 * Matches BE API structure: /api/notification/*
 *
 * @module api/notifications
 */

import { apiFetch } from './client';
import { getAuthHeaders } from './auth';
import { API_NOTIFICATION } from './constants';

// ============================================================================
// Mock Data for Development
// ============================================================================

const MOCK_NOTIFICATIONS = [
  {
    notification_id: 'notif_001',
    title: 'New Task Assigned',
    message: 'You have been assigned to "Water Quality Check" for Pond C-03.',
    type: 'info',
    priority: 'normal',
    read: false,
    data: { task_id: 'task_wqc_001' },
    link: '/user/tasks?id=task_wqc_001',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    notification_id: 'notif_002',
    title: 'Sampling Complete',
    message: 'Sampling #S-2024-001 has been saved successfully.',
    type: 'success',
    priority: 'normal',
    read: false,
    data: { sampling_id: 'S-2024-001' },
    link: '/user/sampling?id=S-2024-001',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    notification_id: 'notif_003',
    title: 'New Message from John',
    message: 'Can you check the feeding schedule for Pond B-05? I noticed some irregularities.',
    type: 'info',
    priority: 'normal',
    read: false,
    data: { sender_key: 'user_john', sender_name: 'John Doe' },
    link: '/user/chat?user=john',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    notification_id: 'notif_004',
    title: 'System Update',
    message: 'New features have been added to the dashboard. Check out the improved analytics!',
    type: 'info',
    priority: 'low',
    read: true,
    data: null,
    link: '/user/dashboard',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_ALERTS = [
  {
    alert_id: 'alert_001',
    title: 'Low Oxygen Level',
    message: 'Oxygen level in Pond A-12 is below threshold. Current: 4.2 mg/L, Threshold: 5.0 mg/L',
    type: 'critical',
    severity: 'high',
    source: 'pond',
    source_id: 'pond_a12',
    acknowledged: false,
    acknowledged_by: null,
    acknowledged_at: null,
    auto_dismiss: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    alert_id: 'alert_002',
    title: 'High Water Temperature',
    message: 'Water temperature exceeded threshold in Pond B-05. Current: 32°C, Threshold: 30°C',
    type: 'warning',
    severity: 'medium',
    source: 'pond',
    source_id: 'pond_b05',
    acknowledged: false,
    acknowledged_by: null,
    acknowledged_at: null,
    auto_dismiss: true,
    dismiss_after_minutes: 60,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    alert_id: 'alert_003',
    title: 'Low Feed Stock',
    message: 'Feed stock for Type-A is running low. Current: 50kg, Minimum: 100kg',
    type: 'warning',
    severity: 'medium',
    source: 'system',
    source_id: null,
    acknowledged: true,
    acknowledged_by: 'user_admin',
    acknowledged_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    auto_dismiss: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    alert_id: 'alert_004',
    title: 'Sync Failed',
    message: 'Failed to sync data with the server. Please check your connection.',
    type: 'error',
    severity: 'high',
    source: 'system',
    source_id: null,
    acknowledged: false,
    acknowledged_by: null,
    acknowledged_at: null,
    auto_dismiss: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

// Store for mock data mutations
let mockNotifications = [...MOCK_NOTIFICATIONS];
let mockAlerts = [...MOCK_ALERTS];

// Flag to use mock data (set to false when API is ready)
const USE_MOCK = false;

// ============================================================================
// NOTIFICATION API Functions
// ============================================================================

/**
 * List notifications for current user
 * @param {object} params - Query params
 * @param {boolean} params.unread - Show only unread
 * @param {number} params.limit - Limit results
 * @param {number} params.skip - Skip results
 * @returns {Promise<object>} { notifications, count, meta }
 */
export async function listNotifications(params = {}) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));

    let result = [...mockNotifications];

    if (params.unread) {
      result = result.filter((n) => !n.read);
    }

    // Sort by created_at (newest first)
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const skip = params.skip || 0;
    const limit = params.limit || 50;
    const paginated = result.slice(skip, skip + limit);

    return {
      success: true,
      data: {
        notifications: paginated,
        count: result.length,
        meta: { limit, skip },
      },
    };
  }

  const qs = new URLSearchParams();
  if (params.unread) qs.append('unread', 'true');
  if (params.limit) qs.append('limit', params.limit);
  if (params.skip) qs.append('skip', params.skip);

  const queryString = qs.toString();
  try {
    const response = await apiFetch(`${API_NOTIFICATION.LIST}${queryString ? '?' + queryString : ''}`, {
      method: 'GET',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to fetch notifications:', error);
    return {
      success: false,
      data: { notifications: [], count: 0, meta: { limit: params.limit || 50, skip: params.skip || 0 } },
      error: error.message,
    };
  }
}

/**
 * Get notification by ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<object>} Notification object
 */
export async function getNotification(notificationId) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100));
    const notif = mockNotifications.find((n) => n.notification_id === notificationId);
    return { success: true, data: notif || null };
  }

  try {
    const response = await apiFetch(API_NOTIFICATION.DETAIL(notificationId), {
      method: 'GET',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to get notification:', error);
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Create a notification
 * @param {object} data - Notification data
 * @returns {Promise<object>} Created notification
 */
export async function createNotification(data) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    const newNotif = {
      notification_id: `notif_${Date.now()}`,
      ...data,
      read: false,
      created_at: new Date().toISOString(),
    };
    mockNotifications.unshift(newNotif);
    return { success: true, data: { notification_id: newNotif.notification_id, message: 'Notification created successfully' } };
  }

  try {
    const response = await apiFetch(API_NOTIFICATION.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to create notification:', error);
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<object>} Updated notification
 */
export async function markNotificationAsRead(notificationId) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100));
    const index = mockNotifications.findIndex((n) => n.notification_id === notificationId);
    if (index !== -1) {
      mockNotifications[index] = { ...mockNotifications[index], read: true };
      return { success: true, data: mockNotifications[index] };
    }
    return { success: false, error: 'Notification not found' };
  }

  try {
    const response = await apiFetch(API_NOTIFICATION.MARK_READ(notificationId), {
      method: 'PUT',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to mark notification as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark all notifications as read
 * @returns {Promise<object>} { message, updated_count }
 */
export async function markAllNotificationsAsRead() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    let count = 0;
    mockNotifications = mockNotifications.map((n) => {
      if (!n.read) {
        count++;
        return { ...n, read: true };
      }
      return n;
    });
    return { success: true, data: { message: 'All notifications marked as read', updated_count: count } };
  }

  try {
    const response = await apiFetch(API_NOTIFICATION.MARK_ALL_READ, {
      method: 'PUT',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to mark all notifications as read:', error);
    return { success: false, data: { message: 'Failed', updated_count: 0 }, error: error.message };
  }
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<object>} Success response
 */
export async function deleteNotification(notificationId) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100));
    const index = mockNotifications.findIndex((n) => n.notification_id === notificationId);
    if (index !== -1) {
      mockNotifications.splice(index, 1);
      return { success: true, data: { message: 'Notification deleted' } };
    }
    return { success: false, error: 'Notification not found' };
  }

  try {
    const response = await apiFetch(API_NOTIFICATION.DELETE(notificationId), {
      method: 'DELETE',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to delete notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Broadcast notification to all users (admin only)
 * @param {object} data - Broadcast data { title, message, type, priority }
 * @returns {Promise<object>} { message, recipients_count }
 */
export async function broadcastNotification(data) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true, data: { message: 'Broadcast notification sent', recipients_count: 10 } };
  }

  try {
    const response = await apiFetch(API_NOTIFICATION.BROADCAST, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to broadcast notification:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// ALERT API Functions
// ============================================================================

/**
 * List alerts for account
 * @param {object} params - Query params
 * @param {boolean} params.unacknowledged - Show only unacknowledged
 * @param {string} params.severity - Filter by severity
 * @param {string} params.type - Filter by type
 * @param {number} params.limit - Limit results
 * @param {number} params.skip - Skip results
 * @returns {Promise<object>} { alerts, count }
 */
export async function listAlerts(params = {}) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));

    let result = [...mockAlerts];

    if (params.unacknowledged) {
      result = result.filter((a) => !a.acknowledged);
    }
    if (params.severity) {
      result = result.filter((a) => a.severity === params.severity);
    }
    if (params.type) {
      result = result.filter((a) => a.type === params.type);
    }

    // Sort by created_at (newest first)
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const skip = params.skip || 0;
    const limit = params.limit || 50;
    const paginated = result.slice(skip, skip + limit);

    return {
      success: true,
      data: {
        alerts: paginated,
        count: result.length,
      },
    };
  }

  const qs = new URLSearchParams();
  if (params.unacknowledged) qs.append('unacknowledged', 'true');
  if (params.severity) qs.append('severity', params.severity);
  if (params.type) qs.append('type', params.type);
  if (params.limit) qs.append('limit', params.limit);
  if (params.skip) qs.append('skip', params.skip);

  const queryString = qs.toString();
  try {
    const response = await apiFetch(`${API_NOTIFICATION.ALERT_LIST}${queryString ? '?' + queryString : ''}`, {
      method: 'GET',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to fetch alerts:', error);
    return {
      success: false,
      data: { alerts: [], count: 0 },
      error: error.message,
    };
  }
}

/**
 * Get alert by ID
 * @param {string} alertId - Alert ID
 * @returns {Promise<object>} Alert object
 */
export async function getAlert(alertId) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100));
    const alert = mockAlerts.find((a) => a.alert_id === alertId);
    return { success: true, data: alert || null };
  }

  try {
    const response = await apiFetch(API_NOTIFICATION.ALERT_DETAIL(alertId), {
      method: 'GET',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to get alert:', error);
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Create an alert
 * @param {object} data - Alert data
 * @returns {Promise<object>} Created alert
 */
export async function createAlert(data) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    const newAlert = {
      alert_id: `alert_${Date.now()}`,
      type: 'warning',
      severity: 'medium',
      source: 'system',
      acknowledged: false,
      acknowledged_by: null,
      acknowledged_at: null,
      auto_dismiss: false,
      ...data,
      created_at: new Date().toISOString(),
    };
    mockAlerts.unshift(newAlert);
    return { success: true, data: { alert_id: newAlert.alert_id, message: 'Alert created successfully' } };
  }

  try {
    const response = await apiFetch(API_NOTIFICATION.ALERT_CREATE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to create alert:', error);
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Acknowledge an alert
 * @param {string} alertId - Alert ID
 * @returns {Promise<object>} Updated alert
 */
export async function acknowledgeAlert(alertId) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100));
    const index = mockAlerts.findIndex((a) => a.alert_id === alertId);
    if (index !== -1) {
      mockAlerts[index] = {
        ...mockAlerts[index],
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: 'current_user',
      };
      return { success: true, data: mockAlerts[index] };
    }
    return { success: false, error: 'Alert not found' };
  }

  try {
    const response = await apiFetch(API_NOTIFICATION.ALERT_ACKNOWLEDGE(alertId), {
      method: 'PUT',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to acknowledge alert:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete an alert (admin only)
 * @param {string} alertId - Alert ID
 * @returns {Promise<object>} Success response
 */
export async function deleteAlert(alertId) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100));
    const index = mockAlerts.findIndex((a) => a.alert_id === alertId);
    if (index !== -1) {
      mockAlerts.splice(index, 1);
      return { success: true, data: { message: 'Alert deleted' } };
    }
    return { success: false, error: 'Alert not found' };
  }

  try {
    const response = await apiFetch(API_NOTIFICATION.ALERT_DELETE(alertId), {
      method: 'DELETE',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Notifications API] Failed to delete alert:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get unread notification count
 * @returns {Promise<number>}
 */
export async function getUnreadNotificationCount() {
  const result = await listNotifications({ unread: true, limit: 0 });
  return result.data?.count || 0;
}

/**
 * Get unacknowledged alert count
 * @returns {Promise<number>}
 */
export async function getUnacknowledgedAlertCount() {
  const result = await listAlerts({ unacknowledged: true, limit: 0 });
  return result.data?.count || 0;
}

// ============================================================================
// Mock/Test Helpers (for development)
// ============================================================================

/**
 * Create a mock notification for testing
 * @param {object} options - Optional overrides
 * @returns {object} Mock notification object
 */
export function createMockNotification(options = {}) {
  const types = ['info', 'success', 'warning', 'error'];
  const priorities = ['low', 'normal', 'high'];

  const mockNotification = {
    notification_id: `notif_mock_${Date.now()}`,
    title: options.title || 'Test Notification',
    message: options.message || 'This is a test notification for development purposes.',
    type: options.type || types[Math.floor(Math.random() * types.length)],
    priority: options.priority || priorities[Math.floor(Math.random() * priorities.length)],
    read: options.read ?? false,
    data: options.data || null,
    link: options.link || null,
    created_at: options.created_at || new Date().toISOString(),
  };

  return mockNotification;
}

/**
 * Add a mock notification to the list and trigger cache update
 * @param {object} options - Optional overrides for the notification
 * @returns {Promise<object>} The created mock notification
 */
export async function addMockNotification(options = {}) {
  const mockNotification = createMockNotification(options);

  // Add to mock data
  mockNotifications.unshift(mockNotification);

  // Trigger cache refresh to show the new notification
  // Import dynamically to avoid circular dependency
  const { refreshNotifications } = await import('../utils/cache/notificationsCache');
  await refreshNotifications();

  return {
    success: true,
    data: mockNotification,
  };
}

/**
 * Create a mock alert for testing
 * @param {object} options - Optional overrides
 * @returns {object} Mock alert object
 */
export function createMockAlert(options = {}) {
  const types = ['info', 'warning', 'error', 'critical'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const sources = ['system', 'pond', 'task', 'expense'];

  const mockAlert = {
    alert_id: `alert_mock_${Date.now()}`,
    title: options.title || 'Test Alert',
    message: options.message || 'This is a test alert for development purposes.',
    type: options.type || types[Math.floor(Math.random() * types.length)],
    severity: options.severity || severities[Math.floor(Math.random() * severities.length)],
    source: options.source || sources[Math.floor(Math.random() * sources.length)],
    source_id: options.source_id || null,
    acknowledged: options.acknowledged ?? false,
    acknowledged_by: options.acknowledged_by || null,
    acknowledged_at: options.acknowledged_at || null,
    auto_dismiss: options.auto_dismiss ?? false,
    created_at: options.created_at || new Date().toISOString(),
  };

  return mockAlert;
}

/**
 * Add a mock alert to the list and trigger cache update
 * @param {object} options - Optional overrides for the alert
 * @returns {Promise<object>} The created mock alert
 */
export async function addMockAlert(options = {}) {
  const mockAlert = createMockAlert(options);

  // Add to mock data
  mockAlerts.unshift(mockAlert);

  // Trigger cache refresh to show the new alert
  const { refreshAlerts } = await import('../utils/cache/alertsCache');
  await refreshAlerts();

  return {
    success: true,
    data: mockAlert,
  };
}

/**
 * Simulate receiving a new notification via WebSocket (for testing)
 * This triggers the cache update as if it came from WebSocket
 * @param {object} options - Optional overrides
 */
export function simulateNewNotification(options = {}) {
  const mockNotification = createMockNotification(options);
  mockNotifications.unshift(mockNotification);

  // Import and trigger cache update if WebSocket is not connected
  // This is handled by the notificationsCache WebSocket subscription
  return mockNotification;
}

/**
 * Simulate receiving a new alert via WebSocket (for testing)
 * @param {object} options - Optional overrides
 */
export function simulateNewAlert(options = {}) {
  const mockAlert = createMockAlert(options);
  mockAlerts.unshift(mockAlert);

  return mockAlert;
}

// ============================================================================
// Export
// ============================================================================

const notificationsApi = {
  // Notifications
  listNotifications,
  getNotification,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  broadcastNotification,
  getUnreadNotificationCount,

  // Alerts
  listAlerts,
  getAlert,
  createAlert,
  acknowledgeAlert,
  deleteAlert,
  getUnacknowledgedAlertCount,

  // Mock/Test helpers
  createMockNotification,
  addMockNotification,
  createMockAlert,
  addMockAlert,
  simulateNewNotification,
  simulateNewAlert,
};

export default notificationsApi;

