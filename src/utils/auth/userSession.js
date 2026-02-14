/**
 * UserSession Singleton
 * Centralized state management for authenticated user data.
 * Stores user info, settings, tokens, and permissions in one place.
 * Prevents redundant API calls by caching all user data after login.
 *
 * @module utils/auth/userSession
 */

import { getPermissions } from '../../api/user';
import { clearPermissionTemplate } from './permissionService';

// ============================================================================
// Storage Keys
// ============================================================================
const STORAGE_KEYS = {
  SESSION: 'tc_user_session',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'access_token_expiry',
};

// ============================================================================
// Event Emitter for Session Changes
// ============================================================================
class SessionEventEmitter {
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
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.error('[UserSession] Event listener error:', e);
        }
      });
    }
  }
}

// ============================================================================
// UserSession Singleton Class
// ============================================================================

class UserSession {
  static instance = null;

  constructor() {
    if (UserSession.instance) {
      return UserSession.instance;
    }

    this._events = new SessionEventEmitter();

    // Token data
    this._accessToken = null;
    this._refreshToken = null;
    this._tokenExpiry = null;

    // User data
    this._user = null;
    this._settings = null;
    this._permissions = null;
    this._account = null;

    // Computed flags
    this._isAdmin = false;
    this._isManager = false;

    // Initialize from localStorage
    this._loadFromStorage();

    UserSession.instance = this;
  }

  // ==========================================================================
  // Singleton Access
  // ==========================================================================
  static getInstance() {
    if (!UserSession.instance) {
      UserSession.instance = new UserSession();
    }
    return UserSession.instance;
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================
  _loadFromStorage() {
    try {
      // Load tokens
      this._accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null;
      this._refreshToken = this._parseJson(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)) || null;
      const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      this._tokenExpiry = expiry ? parseInt(expiry, 10) : null;

      // Load session data
      const sessionData = this._parseJson(localStorage.getItem(STORAGE_KEYS.SESSION));
      if (sessionData) {
        this._user = sessionData.user || null;
        this._settings = sessionData.settings || null;
        this._permissions = sessionData.permissions || null;
        this._account = sessionData.account || null;
        this._isAdmin = sessionData.isAdmin || false;
        this._isManager = sessionData.isManager || false;
      }

      console.debug('[UserSession] Loaded from storage', {
        hasUser: !!this._user,
        hasToken: !!this._accessToken,
      });
    } catch (e) {
      console.error('[UserSession] Failed to load from storage:', e);
    }
  }

  _parseJson(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value; // Return as-is if not JSON
    }
  }


  _saveToStorage() {
    try {
      // Save tokens
      if (this._accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, this._accessToken);
      }
      if (this._refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, JSON.stringify(this._refreshToken));
      }
      if (this._tokenExpiry) {
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, this._tokenExpiry.toString());
      }

      // Save session data - minimalistic for security
      // We only store essential info for hydration. Permissions are better fetched fresh or kept in memory.
      const sessionData = {
        user: {
            // Only store non-sensitive identification info for basic UI hydration
            user_key: this._user?.user_key,
            username: this._user?.username,
            display_name: this._user?.display_name,
            email: this._user?.email,
            profile_photo: this._user?.profile_photo,
            roles: this._user?.roles, // Roles are generally okay, but granular permissions are sensitive
            account_key: this._user?.account_key
        },
        settings: this._settings,
        // Permissions are NOT stored in localStorage for security.
        // They should be re-fetched on session init or kept in memory.
        permissions: null,
        account: this._account,
        isAdmin: this._isAdmin,
        isManager: this._isManager,
        updatedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));

      console.debug('[UserSession] Saved to storage');
    } catch (e) {
      console.error('[UserSession] Failed to save to storage:', e);
    }
  }

  // ==========================================================================
  // Login/Logout
  // ==========================================================================

  /**
   * Initialize session from login response.
   * Call this after successful login to store all user data.
   * Expects camelized keys from apiJsonFetch.
   * @param {object} loginResponse - Full login API response (camelized)
   */
  initFromLoginResponse(loginResponse) {
    if (!loginResponse) {
      throw new Error('Login failed: Empty response from server');
    }

    const data = loginResponse.data || loginResponse;

    // Extract tokens - handle both snake_case (from backend) and camelCase (after camelization)
    this._accessToken = data.accessToken || data.access_token;
    this._refreshToken = data.refreshToken || data.refresh_token;

    // Validate tokens are present
    if (!this._accessToken || !this._refreshToken) {
      console.error('[UserSession] Missing tokens in response:', {
        hasAccessToken: !!this._accessToken,
        hasRefreshToken: !!this._refreshToken,
        responseKeys: Object.keys(data)
      });
      throw new Error('No access or refresh token received from server');
    }

    console.log('[UserSession] Tokens extracted successfully');

    // Calculate token expiry from JWT or from response
    if (this._accessToken) {
      const payload = this._parseJwt(this._accessToken);
      if (payload && payload.exp) {
        this._tokenExpiry = payload.exp * 1000; // Convert to ms
      } else {
        // Try to get expiry from response - handle both formats
        const expiresIn = data.expiresIn || data.expires_in;
        const expiresInDays = data.accessTokenExpiresInDays || data.access_token_expires_in_days;

        if (expiresInDays) {
          // Expires in days
          this._tokenExpiry = Date.now() + (expiresInDays * 24 * 3600 * 1000);
        } else if (expiresIn) {
          // Expires in seconds
          this._tokenExpiry = Date.now() + (expiresIn * 1000);
        } else {
          // Default to 1 hour from now
          this._tokenExpiry = Date.now() + 3600 * 1000;
        }
      }
    }

    // Extract user info
    this._user = this._extractUser(data);

    // Extract settings
    this._settings = data.settings || data.user?.settings || null;

    // Extract permissions
    this._permissions = data.permissions || data.user?.permissions || null;

    // Extract account/company info
    this._account = this._extractAccount(data);

    // Compute role flags
    this._computeRoleFlags();

    // Persist to storage
    this._saveToStorage();

    // Emit change event
    this._events.emit('login', this.getSnapshot());
    this._events.emit('change', this.getSnapshot());

    console.debug('[UserSession] Initialized from login', {
      user: this._user?.username || this._user?.email,
      isAdmin: this._isAdmin,
      tokenExpiry: new Date(this._tokenExpiry).toISOString(),
    });
  }

  /**
   * Load permissions from API and cache them.
   */
  async loadPermissions() {
    try {
      const res = await getPermissions();
      let data;
      if (res.json) {
         data = await res.json();
      } else {
         data = res;
      }

      const permissionsData = data.data || data;
      this._permissions = permissionsData;

      // Update role if present in permissions data (as seen in user example output)
      if (permissionsData.role && this._user) {
          this._user.role = permissionsData.role;
          this._isAdmin = this._checkAdmin();
          this._isManager = this._checkManager();
      }

      // Do NOT save permissions to storage, only memory
      // this._saveToStorage();

      this._events.emit('permissionsUpdated', this._permissions);
      console.log('[UserSession] Permissions loaded (Memory Only):', this._permissions);
      return this._permissions;
    } catch (e) {
      console.error('[UserSession] Failed to load permissions:', e);
      return null;
    }
  }

  _extractUser(data) {
    // Handle various response shapes - handle both snake_case and camelCase
    const user = data.user || data.userInfo || data;

    return {
      user_key: user.userKey || user.user_key || user.id,
      username: user.username || user.user_name,
      email: user.email,
      display_name: user.displayName || user.display_name || user.name || user.fullName || user.full_name,
      mobile: user.mobile || user.phone,
      account_key: user.accountKey || user.account_key || data.accountKey || data.account_key,
      roles: user.roles || (user.role ? [user.role] : []),
      profile_photo: user.profilePhoto || user.profile_photo || user.avatar,
      active: user.active !== false,
      createdAt: user.createdAt || user.created_at,
      updatedAt: user.updatedAt || user.updated_at,
      // Keep any extra fields
      ...this._filterKnownKeys(user),
    };
  }

  _extractAccount(data) {
    const account = data.account || data.company || {};
    return {
      account_key: account.accountKey || account.account_key || data.accountKey || data.account_key || this._user?.account_key,
      company_name: account.companyName || account.company_name || account.name,
      ...account,
    };
  }

  _filterKnownKeys(obj) {
    const knownKeys = [
      'user_key', 'userKey', 'id', 'username', 'userName', 'user_name', 'email',
      'display_name', 'displayName', 'name', 'fullName', 'full_name', 'mobile', 'phone',
      'account_key', 'accountKey', 'roles', 'role', 'profile_photo',
      'profilePhoto', 'avatar', 'active', 'createdAt', 'created_at',
      'updatedAt', 'updated_at', 'accessToken', 'access_token', 'refreshToken', 'refresh_token',
      'settings', 'permissions', 'account', 'company', 'companyName', 'company_name',
      'expiresIn', 'expires_in', 'accessTokenExpiresInDays', 'access_token_expires_in_days',
      'refreshTokenExpiresInDays', 'refresh_token_expires_in_days', 'tokenType', 'token_type',
    ];
    const extra = {};
    for (const key of Object.keys(obj)) {
      if (!knownKeys.includes(key) && typeof obj[key] !== 'function') {
        extra[key] = obj[key];
      }
    }
    return extra;
  }

  _computeRoleFlags() {
    const roles = this._user?.roles || [];
    const permissions = this._permissions;

    // Check for admin
    this._isAdmin = roles.some((r) =>
      typeof r === 'string' && r.toLowerCase().includes('admin')
    ) || (permissions?.name && permissions.name.toLowerCase().includes('admin'));

    // Check for manager
    this._isManager = roles.some((r) =>
      typeof r === 'string' && r.toLowerCase().includes('manager')
    ) || this._isAdmin; // Admins are also managers
  }

  _checkAdmin() {
    const role = this._user?.role?.toLowerCase() || '';
    const roles = this._user?.roles?.map(r => String(r).toLowerCase()) || [];
    return role === 'admin' || role === 'owner' || roles.includes('admin') || roles.includes('owner');
  }

  _checkManager() {
    if (this._checkAdmin()) return true;
    const role = this._user?.role?.toLowerCase() || '';
    const roles = this._user?.roles?.map(r => String(r).toLowerCase()) || [];
    return role === 'manager' || roles.includes('manager');
  }

  _parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Clear all session data (logout).
   */
  logout() {
    this._accessToken = null;
    this._refreshToken = null;
    this._tokenExpiry = null;
    this._user = null;
    this._settings = null;
    this._permissions = null;
    this._account = null;
    this._isAdmin = false;
    this._isManager = false;

    // Clear permission template from memory
    clearPermissionTemplate();

    // Clear storage
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);

    // Also clear legacy keys
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('tasks');
    localStorage.removeItem('tasks_last_fetched');

    this._events.emit('logout');
    this._events.emit('change', null);

    console.debug('[UserSession] Logged out');
  }

  // ==========================================================================
  // Getters
  // ==========================================================================

  get isAuthenticated() {
    return !!(this._accessToken && this._user);
  }

  get isAdmin() {
    return this._isAdmin;
  }

  get isManager() {
    return this._isManager;
  }

  get accessToken() {
    return this._accessToken;
  }

  get refreshToken() {
    return this._refreshToken;
  }

  get tokenExpiry() {
    return this._tokenExpiry;
  }


  get isTokenExpiringSoon() {
    if (!this._tokenExpiry) return true;
    return Date.now() >= this._tokenExpiry - 2 * 60 * 1000; // 2 min buffer
  }

  get user() {
    return this._user;
  }

  get userKey() {
    return this._user?.user_key || null;
  }

  get username() {
    return this._user?.username || null;
  }

  get email() {
    return this._user?.email || null;
  }

  get displayName() {
    return this._user?.display_name || this._user?.username || null;
  }

  get accountKey() {
    return this._user?.account_key || this._account?.account_key || null;
  }

  get roles() {
    return this._user?.roles || [];
  }

  get settings() {
    return this._settings;
  }

  get permissions() {
    return this._permissions;
  }

  get account() {
    return this._account;
  }

  get profilePhoto() {
    return this._user?.profile_photo || null;
  }

  // ==========================================================================
  // Setters / Updates
  // ==========================================================================

  /**
   * Update access token (after refresh).
   * @param {string} accessToken
   * @param {number} [expiresIn] - seconds until expiry
   */
  updateAccessToken(accessToken, expiresIn) {
    this._accessToken = accessToken;
    if (expiresIn) {
      this._tokenExpiry = Date.now() + expiresIn * 1000;
    } else {
      const payload = this._parseJwt(accessToken);
      if (payload?.exp) {
        this._tokenExpiry = payload.exp * 1000;
      }
    }
    this._saveToStorage();
    this._events.emit('tokenRefresh', { accessToken, expiry: this._tokenExpiry });
  }

  /**
   * Update user settings.
   * @param {object} settings
   */
  updateSettings(settings) {
    this._settings = { ...this._settings, ...settings };
    this._saveToStorage();
    this._events.emit('settingsChange', this._settings);
    this._events.emit('change', this.getSnapshot());
  }

  /**
   * Update user profile.
   * @param {object} profileData
   */
  updateProfile(profileData) {
    this._user = { ...this._user, ...profileData };
    this._computeRoleFlags();
    this._saveToStorage();
    this._events.emit('profileChange', this._user);
    this._events.emit('change', this.getSnapshot());
  }

  // ==========================================================================
  // Events
  // ==========================================================================

  /**
   * Subscribe to session events.
   * @param {string} event - 'login' | 'logout' | 'change' | 'tokenRefresh' | 'settingsChange' | 'profileChange'
   * @param {function} callback
   * @returns {function} Unsubscribe function
   */
  on(event, callback) {
    return this._events.on(event, callback);
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  /**
   * Get a snapshot of current session state.
   * @returns {object}
   */
  getSnapshot() {
    return {
      isAuthenticated: this.isAuthenticated,
      isAdmin: this.isAdmin,
      isManager: this.isManager,
      user: this._user,
      settings: this._settings,
      permissions: this._permissions,
      account: this._account,
      tokenExpiry: this._tokenExpiry,
    };
  }

  /**
   * Check if user has a specific role.
   * @param {string} role
   * @returns {boolean}
   */
  hasRole(role) {
    if (!role) return false;
    return this.roles.some((r) =>
      typeof r === 'string' && r.toLowerCase() === role.toLowerCase()
    );
  }

  /**
   * Check if user has any of the specified roles.
   * @param {string[]} roles
   * @returns {boolean}
   */
  hasAnyRole(roles) {
    if (!Array.isArray(roles)) return false;
    return roles.some((role) => this.hasRole(role));
  }
}

// ============================================================================
// Export Singleton Instance & Class
// ============================================================================
export const userSession = UserSession.getInstance();
export default userSession;
export { UserSession };
