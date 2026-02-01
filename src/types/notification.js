// JSDoc type definitions for notification-related API shapes

/**
 * @typedef {Object} Notification
 * @property {string} notification_id - Notification ID (12-digit format: YYMMDDHHmmSS)
 * @property {string} account_key - Account key
 * @property {string} user_key - User key who receives the notification
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {'task'|'info'|'success'|'warning'|'error'|'alert'|'message'} type - Notification type
 * @property {'info'|'success'|'warning'|'error'|'task'|'alert'|'message'} [notification_type] - Notification type (alias)
 * @property {'low'|'normal'|'high'|'urgent'} [priority] - Notification priority
 * @property {'unread'|'read'} status - Notification status
 * @property {boolean} [is_read] - Whether notification has been read
 * @property {string} [read_at] - ISO timestamp when read
 * @property {string} [link] - URL to navigate to when clicked
 * @property {Object} [data] - Additional data payload
 * @property {string} [reminder_at] - ISO timestamp for reminder
 * @property {number} [reminder_count] - Number of times reminder has been sent
 * @property {string} created_at - ISO timestamp when created
 * @property {string} [updated_at] - ISO timestamp when updated
 */

/**
 * @typedef {Object} NotificationsListResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Response data
 * @property {Array<Notification>} data.notifications - Array of notifications
 */

/**
 * @typedef {Object} NotificationCount
 * @property {number} total - Total notifications count
 * @property {number} unread - Unread notifications count
 */

/**
 * @typedef {Object} NotificationCountResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Count data
 * @property {number} data.count - Unread count
 */

/**
 * @typedef {Object} CreateNotificationRequest
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {'info'|'success'|'warning'|'error'|'task'|'alert'|'message'} type - Notification type
 * @property {'low'|'normal'|'high'|'urgent'} [priority] - Notification priority
 * @property {string} [link] - URL to navigate to
 * @property {Object} [data] - Additional data payload
 * @property {string} [reminder_at] - ISO timestamp for reminder
 */

/**
 * @typedef {Object} UpdateNotificationRequest
 * @property {string} [title] - Notification title
 * @property {string} [message] - Notification message
 * @property {'info'|'success'|'warning'|'error'|'task'|'alert'|'message'} [type] - Notification type
 * @property {'low'|'normal'|'high'|'urgent'} [priority] - Notification priority
 * @property {boolean} [is_read] - Mark as read
 * @property {string} [link] - URL to navigate to
 * @property {Object} [data] - Additional data payload
 * @property {string} [reminder_at] - ISO timestamp for reminder
 */

/**
 * @typedef {Object} NotificationCount
 * @property {number} total - Total notifications count
 * @property {number} unread - Unread notifications count
 */

// Export nothing at runtime; file is used for JSDoc imports
export default {};
