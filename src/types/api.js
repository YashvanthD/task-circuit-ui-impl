// Generic API JSDoc types

/**
 * Standard API Success Response Wrapper
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Always true for successful responses
 * @property {T} data - Response data payload
 * @property {string} [message] - Optional success message
 * @property {string} [timestamp] - ISO timestamp of response
 */

/**
 * Standard API Error Response
 * @typedef {Object} ApiErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {string} error - Error message
 * @property {string} [code] - Error code
 * @property {string} [timestamp] - ISO timestamp of response
 */

/**
 * Paginated Response
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Data container
 * @property {Array<T>} data.items - Array of items
 * @property {PaginationMeta} data.pagination - Pagination metadata
 * @property {string} [timestamp] - ISO timestamp
 */

/**
 * Pagination Metadata
 * @typedef {Object} PaginationMeta
 * @property {number} page - Current page number (1-based)
 * @property {number} limit - Items per page
 * @property {number} total - Total items count
 * @property {number} pages - Total pages count
 */

/**
 * List Response (without explicit pagination)
 * @template T
 * @typedef {Object} ListResponse
 * @property {Array<T>} items - Array of items
 * @property {number} [total] - Total count
 */

export default {};



