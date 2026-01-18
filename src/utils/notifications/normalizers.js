/**
 * Notifications - Normalizers
 *
 * @module utils/notifications/normalizers
 */

/**
 * Normalize a notification from API
 * @param {object} notif - Raw notification
 * @returns {object} Normalized notification
 */
export function normalizeNotification(notif) {
  if (!notif) return null;

  return {
    notification_id: notif.notification_id || notif.notificationId || notif.id,
    title: notif.title || '',
    message: notif.message || notif.body || '',
    type: notif.type || 'info',
    priority: notif.priority || 'normal',
    read: !!notif.read,
    data: notif.data || null,
    link: notif.link || notif.action_url || null,
    created_at: notif.created_at || notif.createdAt || new Date().toISOString(),
    read_at: notif.read_at || notif.readAt || null,
  };
}

/**
 * Normalize an alert from API
 * @param {object} alert - Raw alert
 * @returns {object} Normalized alert
 */
export function normalizeAlert(alert) {
  if (!alert) return null;

  return {
    alert_id: alert.alert_id || alert.alertId || alert.id,
    title: alert.title || '',
    message: alert.message || alert.body || '',
    type: alert.type || 'warning',
    severity: alert.severity || 'medium',
    source: alert.source || 'system',
    source_id: alert.source_id || alert.sourceId || null,
    acknowledged: !!alert.acknowledged,
    acknowledged_by: alert.acknowledged_by || alert.acknowledgedBy || null,
    acknowledged_at: alert.acknowledged_at || alert.acknowledgedAt || null,
    auto_dismiss: !!alert.auto_dismiss,
    dismiss_after_minutes: alert.dismiss_after_minutes || null,
    created_at: alert.created_at || alert.createdAt || new Date().toISOString(),
  };
}

export default {
  normalizeNotification,
  normalizeAlert,
};

