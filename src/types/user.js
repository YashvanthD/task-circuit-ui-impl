// JSDoc type definitions for user-related API shapes
/**
 * @typedef {Object} User
 * @property {string} user_key - Primary account user key (canonical)
 * @property {string} [id] - Alternate id field
 * @property {string} [username] - Login username
 * @property {string} [display_name] - User display name / full name
 * @property {string} [email] - Primary email
 * @property {string} [mobile] - Mobile number
 * @property {string} [account_key] - Account key the user belongs to
 * @property {Array<string>} [roles] - Roles assigned to user
 * @property {boolean} [active] - Whether user is active
 * @property {string} [createdAt] - ISO created timestamp
 * @property {string} [updatedAt] - ISO updated timestamp
 * @property {Object} [profile] - Extra profile metadata
 * @property {string} [profile_photo] - URL to profile photo
 * @property {string} [user_key_alias] - alias for user key (some APIs return userKey)
 */

/**
 * @typedef {Object} UserListResponse
 * @property {Array<User>} users
 */

export default {};

