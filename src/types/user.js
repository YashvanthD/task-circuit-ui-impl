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
 * @typedef {Object} UserSettings
 * @property {string} user_key - User key
 * @property {string} [language] - Preferred language
 * @property {string} [timezone] - Preferred timezone
 * @property {boolean} [email_notifications] - Enable email notifications
 * @property {boolean} [sms_notifications] - Enable SMS notifications
 * @property {boolean} [push_notifications] - Enable push notifications
 * @property {string} [theme] - UI theme preference
 * @property {Object} [metadata] - Additional settings
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} user_key - User key
 * @property {string} [first_name] - First name
 * @property {string} [last_name] - Last name
 * @property {string} [display_name] - Display name
 * @property {string} [avatar_url] - Avatar URL
 * @property {string} [bio] - User bio
 * @property {string} [phone] - Phone number
 * @property {string} [address] - Address
 * @property {Object} [metadata] - Additional profile data
 */

/**
 * @typedef {Object} UserAuth
 * @property {string} user_key - User key
 * @property {string} username - Username for login
 * @property {string} email - Email for login
 * @property {boolean} [mfa_enabled] - Whether MFA is enabled
 * @property {string} [mfa_method] - MFA method (e.g., 'totp', 'sms')
 * @property {string} [last_login_at] - ISO timestamp of last login
 * @property {Object} [metadata] - Additional auth data
 */

/**
 * @typedef {Object} TokenSettings
 * @property {number} [access_token_expires_in] - Access token expiry in seconds
 * @property {number} [refresh_token_expires_in] - Refresh token expiry in seconds
 * @property {boolean} [remember_me_enabled] - Whether remember me is enabled
 */

/**
 * @typedef {Object} UserPermissions
 * @property {string} user_key - User key
 * @property {Array<string>} roles - Assigned roles
 * @property {Array<string>} permissions - Direct permissions
 * @property {Array<string>} pond_access - Pond IDs user has access to
 * @property {Object} [metadata] - Additional permissions data
 */

/**
 * @typedef {Object} AuthSession
 * @property {string} session_key - Session key
 * @property {string} user_key - User key
 * @property {string} device - Device information
 * @property {string} ip_address - IP address
 * @property {string} created_at - ISO timestamp when created
 * @property {string} expires_at - ISO timestamp when expires
 * @property {boolean} is_active - Whether session is active
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email - Email or username
 * @property {string} password - Password
 * @property {boolean} [remember_me] - Remember me flag
 */

/**
 * @typedef {Object} LoginResponse
 * @property {boolean} success - Always true for successful login
 * @property {Object} data - Login response data
 * @property {string} data.access_token - JWT access token
 * @property {string} data.refresh_token - JWT refresh token
 * @property {User} data.user - User object
 * @property {Object} [data.account] - Account/company object
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} email - Email address
 * @property {string} password - Password
 * @property {string} name - User name
 * @property {string} [organization_name] - Organization name (optional)
 */

/**
 * @typedef {Object} RegisterResponse
 * @property {boolean} success - Always true for successful registration
 * @property {Object} data - Registration response data
 * @property {string} data.access_token - JWT access token
 * @property {string} data.refresh_token - JWT refresh token
 * @property {string} data.user_key - User key
 * @property {string} data.account_key - Account key
 * @property {number} data.expires_in - Token expiry in seconds
 */

/**
 * @typedef {Object} ValidateTokenResponse
 * @property {boolean} success - Always true for valid token
 * @property {Object} data - Validation data
 * @property {boolean} data.valid - Whether token is valid
 * @property {Object} data.payload - Token payload
 * @property {string} data.payload.user_key - User key
 * @property {string} data.payload.account_key - Account key
 * @property {string} data.payload.role - User role
 */

/**
 * @typedef {Object} RefreshTokenRequest
 * @property {string} refresh_token - Refresh token
 */

/**
 * @typedef {Object} RefreshTokenResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Refresh response data
 * @property {string} data.access_token - New JWT access token
 * @property {number} data.expires_in - Token expiry in seconds
 */

/**
 * @typedef {Object} PasswordChangeRequest
 * @property {string} current_password - Current password
 * @property {string} new_password - New password
 */

/**
 * @typedef {Object} PasswordResetRequest
 * @property {string} token - Reset token from email
 * @property {string} new_password - New password
 */

/**
 * @typedef {Object} UserListResponse
 * @property {Array<User>} users
 */

export default {};

