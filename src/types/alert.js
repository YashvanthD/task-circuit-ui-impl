// JSDoc type definitions for alert-related API shapes

/**
 * @typedef {Object} Alert
 * @property {string} alert_id - Alert ID (12-digit format: YYMMDDHHmmSS)
 * @property {string} account_key - Account key
 * @property {string} title - Alert title
 * @property {string} message - Alert message
 * @property {'low'|'medium'|'high'|'critical'} priority - Alert priority level
 * @property {'info'|'warning'|'critical'|'error'} [severity] - Alert severity level (alias)
 * @property {string} [category] - Alert category (e.g., 'water_quality', 'system', 'pond')
 * @property {'unread'|'read'|'acknowledged'|'resolved'|'expired'} status - Alert status
 * @property {string} [source] - Alert source (e.g., 'system', 'user', 'iot')
 * @property {string} [source_id] - Source entity ID
 * @property {string} [acknowledged_by] - User key who acknowledged
 * @property {string} [acknowledged_at] - ISO timestamp when acknowledged
 * @property {string} [resolved_by] - User key who resolved
 * @property {string} [resolved_at] - ISO timestamp when resolved
 * @property {string} [reminder_at] - ISO timestamp for reminder
 * @property {number} [reminder_count] - Number of times reminder has been sent
 * @property {string} created_at - ISO timestamp when created
 * @property {string} [updated_at] - ISO timestamp when updated
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} AlertsListResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Response data
 * @property {Array<Alert>} data.alerts - Array of alerts
 */

/**
 * @typedef {Object} AlertStats
 * @property {number} total - Total alerts count
 * @property {number} unread - Unread alerts count
 * @property {number} high_priority - High priority alerts count
 * @property {number} [active] - Active alerts count
 * @property {number} [acknowledged] - Acknowledged alerts count
 * @property {number} [resolved] - Resolved alerts count
 * @property {Object} [by_severity] - Count by severity level
 * @property {number} [by_severity.critical] - Critical alerts count
 * @property {number} [by_severity.warning] - Warning alerts count
 * @property {number} [by_severity.info] - Info alerts count
 */

/**
 * @typedef {Object} AlertStatsResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Stats data (AlertStats fields at top level)
 * @property {number} data.total - Total alerts
 * @property {number} data.unread - Unread alerts
 * @property {number} data.high_priority - High priority alerts
 */

/**
 * @typedef {Object} CreateAlertRequest
 * @property {string} title - Alert title
 * @property {string} message - Alert message
 * @property {'info'|'warning'|'critical'|'error'} severity - Alert severity
 * @property {string} [category] - Alert category
 * @property {string} [source] - Alert source
 * @property {string} [source_id] - Source entity ID
 * @property {string} [reminder_at] - ISO timestamp for reminder
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} UpdateAlertRequest
 * @property {string} [title] - Alert title
 * @property {string} [message] - Alert message
 * @property {'info'|'warning'|'critical'|'error'} [severity] - Alert severity
 * @property {string} [category] - Alert category
 * @property {'active'|'acknowledged'|'resolved'} [status] - Alert status
 * @property {string} [reminder_at] - ISO timestamp for reminder
 * @property {Object} [metadata] - Additional metadata
 */

// Export nothing at runtime; file is used for JSDoc imports
export default {};
