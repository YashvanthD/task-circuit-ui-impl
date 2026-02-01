// JSDoc type definitions for task-related API shapes

/**
 * @typedef {Object} Task
 * @property {string} task_id - Task ID (12-digit format: YYMMDDHHmmSS)
 * @property {string} account_key - Account key
 * @property {string} title - Task title
 * @property {string} [description] - Task description
 * @property {'pending'|'in_progress'|'completed'|'cancelled'} status - Task status
 * @property {'low'|'medium'|'high'|'urgent'} [priority] - Task priority
 * @property {string} [assignee] - User key assigned to (alias: assigned_to)
 * @property {string} [assigned_to] - User key assigned to
 * @property {string} [assigned_by] - User key who assigned
 * @property {string} [due_date] - Due date (ISO date string or date-time)
 * @property {string} [completed_at] - ISO timestamp when completed
 * @property {string} [completed_by] - User key who completed
 * @property {string} [category] - Task category (e.g., 'feeding', 'sampling', 'maintenance')
 * @property {string} [pond_id] - Related pond ID
 * @property {string} [stock_id] - Related stock ID
 * @property {Object} [metadata] - Additional metadata
 * @property {string} [reminder_at] - ISO timestamp for reminder
 * @property {number} [reminder_count] - Number of times reminder has been sent
 * @property {string} created_at - ISO timestamp when created
 * @property {string} [updated_at] - ISO timestamp when updated
 */

/**
 * @typedef {Object} TasksListResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Response data
 * @property {Array<Task>} data.tasks - Array of tasks
 */

/**
 * @typedef {Object} CreateTaskRequest
 * @property {string} title - Task title
 * @property {string} [description] - Task description
 * @property {'low'|'normal'|'high'|'urgent'} [priority] - Task priority
 * @property {string} [assigned_to] - User key to assign to
 * @property {string} [due_date] - Due date (ISO date string)
 * @property {string} [category] - Task category
 * @property {string} [pond_id] - Related pond ID
 * @property {string} [stock_id] - Related stock ID
 * @property {string} [reminder_at] - ISO timestamp for reminder
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} UpdateTaskRequest
 * @property {string} [title] - Task title
 * @property {string} [description] - Task description
 * @property {'pending'|'in_progress'|'completed'|'cancelled'} [status] - Task status
 * @property {'low'|'normal'|'high'|'urgent'} [priority] - Task priority
 * @property {string} [assigned_to] - User key to assign to
 * @property {string} [due_date] - Due date (ISO date string)
 * @property {string} [category] - Task category
 * @property {string} [pond_id] - Related pond ID
 * @property {string} [stock_id] - Related stock ID
 * @property {string} [reminder_at] - ISO timestamp for reminder
 * @property {Object} [metadata] - Additional metadata
 */

// Export nothing at runtime; file is used for JSDoc imports
export default {};
