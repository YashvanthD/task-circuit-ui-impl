/**
 * User Model Class
 * Represents a user entity with validation and normalization
 * Based on backend schema: references/entities/user.yaml
 *
 * @module models/User
 */

import { BaseModel } from './BaseModel';

export class User extends BaseModel {
  /**
   * Create a User instance
   * @param {Object} data - User data from backend (snake_case)
   */
  constructor(data = {}) {
    super(data);
  }

  static get schema() {
    return {
      user_key: { type: 'string', required: true, aliases: ['userKey', 'id'] },
      username: { type: 'string', aliases: ['user_name'] },
      email: {
        type: 'string',
        validate: (val, model) => !val || model._isValidEmail(val),
        errorMessage: 'Invalid email format'
      },
      display_name: { type: 'string', aliases: ['displayName', 'name'] },
      mobile: { type: 'string', aliases: ['phone'] },
      account_key: { type: 'string', aliases: ['accountKey'] },
      role: { type: 'string', default: 'user' },
      roles: {
        type: 'array',
        default: (data) => data.roles || (data.role ? [data.role] : ['user'])
      },
      permissions: { type: 'array', default: [] },
      active: { type: 'boolean', default: true },
      is_verified: { type: 'boolean', default: false, aliases: ['isVerified'] },
      profile_photo: { type: 'string', aliases: ['profilePhoto', 'avatar_url', 'avatar'] },
      profile: { type: 'object', default: {} },
      created_at: { type: 'string', aliases: ['createdAt'] },
      updated_at: { type: 'string', aliases: ['updatedAt'] },
      last_login_at: { type: 'string', aliases: ['lastLoginAt'] },
      metadata: { type: 'object', default: {} },
    };
  }

  _validate() {
    super._validate();
    if (!this.email && !this.username) {
      this._addError('email', 'Email or username is required');
    }
  }

  _isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  isAdmin() {
    return this.role === 'admin' || this.roles.includes('admin');
  }

  /**
   * Check if user is manager
   * @returns {boolean}
   */
  isManager() {
    return this.role === 'manager' || this.roles.includes('manager');
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  hasRole(role) {
    return this.role === role || this.roles.includes(role);
  }

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean}
   */
  hasPermission(permission) {
    return this.permissions.includes(permission) || this.isAdmin();
  }

  /**
   * Get display name or fallback
   * @returns {string}
   */
  getDisplayName() {
    return this.display_name || this.username || this.email || 'Unknown User';
  }

  /**
   * Get user initials for avatar
   * @returns {string}
   */
  getInitials() {
    const name = this.getDisplayName();
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Get avatar URL or generate placeholder
   * @returns {string}
   */
  getAvatarUrl() {
    if (this.profile_photo) return this.profile_photo;
    // Return placeholder URL
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.getDisplayName())}&background=random`;
  }

  /**
   * Default form values for creating a new user
   */
  static getDefaultFormData() {
    return {
      username: '',
      email: '',
      password: '',
      mobile: '',
      display_name: '',
      role: 'user',
      permissions: [],
      active: true
    };
  }

  /**
   * Create from form data
   * @param {Object} formData - Form data
   * @returns {User}
   */
  static fromFormData(formData) {
    return new User(formData);
  }

  /**
   * Get user ID safely (handles both direct property and _raw)
   * @returns {string}
   */
  getUserId() {
    return String(this.user_key || this._raw?.user_key || this.id || this._raw?.id || '');
  }

  /**
   * Get username safely
   * @returns {string}
   */
  getUserName() {
    return this.username || this._raw?.username || this.email || this._raw?.email || 'Unknown User';
  }

  /**
   * Check if user has a valid ID
   * @returns {boolean}
   */
  hasValidId() {
    const id = this.getUserId();
    return id !== '' && id !== 'undefined' && id !== 'null';
  }

  /**
   * Convert to API payload format
   * @returns {Object}
   */
  toAPIPayload() {
    const payload = {
      username: this.username,
      email: this.email
    };

    if (this.display_name) {
      payload.display_name = this.display_name;
    }

    if (this.mobile) {
      payload.mobile = this.mobile;
    }

    if (this.role) {
      payload.role = this.role;
    }

    if (this.permissions && this.permissions.length > 0) {
      payload.permissions = this.permissions;
    }

    if (this.active !== undefined) {
      payload.active = this.active;
    }

    if (this.profile && Object.keys(this.profile).length > 0) {
      payload.profile = this.profile;
    }

    return payload;
  }

  /**
   * Convert user to option format for dropdowns
   * @returns {Object}
   */
  toOption() {
    return {
      id: this.getUserId(),
      label: this.getDisplayName(),
      value: this.getUserId()
    };
  }

  /**
   * Create dropdown label for user
   * @param {Object} options - Label options
   * @param {boolean} options.showEmail - Include email (default: false)
   * @param {boolean} options.showRole - Include role (default: false)
   * @param {boolean} options.showId - Include user ID (default: false)
   * @param {boolean} options.showMobile - Include mobile (default: false)
   * @param {string} options.delimiter - Separator between parts (default: " | ")
   * @returns {string}
   */
  getDropdownLabel(options = {}) {
    const {
      showEmail = false,
      showRole = false,
      showId = false,
      showMobile = false,
      delimiter = ' | '
    } = options;

    const parts = [];

    // Always include display name first
    parts.push(this.getDisplayName());

    if (showEmail && this.email) {
      parts.push(this.email);
    }

    if (showRole && this.role) {
      parts.push(this.role);
    }

    if (showId && this.user_key) {
      parts.push(this.user_key);
    }

    if (showMobile && this.mobile) {
      parts.push(this.mobile);
    }

    return parts.join(delimiter);
  }

  /**
   * Convert users array to dropdown options with flexible labeling
   * @param {Array<User>} users - Array of user instances
   * @param {Object} labelOptions - Options for label formatting
   * @returns {Array<Object>} Array of {id, user_key, label, raw} objects
   */
  static toDropdownOptions(users, labelOptions = {}) {
    if (!Array.isArray(users)) return [];

    return users.map(user => ({
      id: user.user_key || user.id,
      user_key: user.user_key || user.id,
      label: user instanceof User
        ? user.getDropdownLabel(labelOptions)
        : (user.display_name || user.username || user.email || 'Unknown User'),
      raw: user
    }));
  }

  /**
   * Convert users array to dropdown options
   * @param {User[]} users - Array of User instances
   * @returns {Array<{id: string, label: string, value: string}>}
   */
  static toOptions(users) {
    if (!Array.isArray(users)) return [];
    return users.map(user => user.toOption());
  }
}

export default User;
