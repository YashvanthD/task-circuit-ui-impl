/**
 * UserSession Singleton
 * Centralized state management for authenticated user data.
 * Stores user info, settings, tokens, and permissions in one place.
 * Prevents redundant API calls by caching all user data after login.
 *
 * @module utils/auth/userSession
 */

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
    this._initialized = false;

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

      this._initialized = true;
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

      // Save session data
      const sessionData = {
        user: this._user,
        settings: this._settings,
        permissions: this._permissions,
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
   * @param {object} loginResponse - Full login API response
   */
  initFromLoginResponse(loginResponse) {
    if (!loginResponse) {
      console.warn('[UserSession] Empty login response');
      return;
    }

    const data = loginResponse.data || loginResponse;

    // Extract tokens
    this._accessToken = data.accessToken || data.access_token || null;
    this._refreshToken = data.refreshToken || data.refresh_token || null;

    // Calculate token expiry from JWT
    if (this._accessToken) {
      const payload = this._parseJwt(this._accessToken);
      if (payload && payload.exp) {
        this._tokenExpiry = payload.exp * 1000; // Convert to ms
      } else {
        // Default to 1 hour from now
        this._tokenExpiry = Date.now() + 3600 * 1000;
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
    });
  }

  _extractUser(data) {
    // Handle various response shapes
    const user = data.user || data.userInfo || data;

    return {
      user_key: user.user_key || user.userKey || user.id || null,
      username: user.username || user.userName || null,
      email: user.email || null,
      display_name: user.display_name || user.displayName || user.name || user.fullName || null,
      mobile: user.mobile || user.phone || null,
      account_key: user.account_key || user.accountKey || data.account_key || null,
      roles: user.roles || (user.role ? [user.role] : []),
      profile_photo: user.profile_photo || user.profilePhoto || user.avatar || null,
      active: user.active !== false,
      createdAt: user.createdAt || user.created_at || null,
      updatedAt: user.updatedAt || user.updated_at || null,
      // Keep any extra fields
      ...this._filterKnownKeys(user),
    };
  }

  _extractAccount(data) {
    const account = data.account || data.company || {};
    return {
      account_key: account.account_key || account.accountKey || data.account_key || this._user?.account_key || null,
      company_name: account.company_name || account.companyName || account.name || null,
      ...account,
    };
  }

  _filterKnownKeys(obj) {
    const knownKeys = [
      'user_key', 'userKey', 'id', 'username', 'userName', 'email',
      'display_name', 'displayName', 'name', 'fullName', 'mobile', 'phone',
      'account_key', 'accountKey', 'roles', 'role', 'profile_photo',
      'profilePhoto', 'avatar', 'active', 'createdAt', 'created_at',
      'updatedAt', 'updated_at', 'accessToken', 'refreshToken', 'settings',
      'permissions', 'account', 'company',
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

  get isTokenExpired() {
    if (!this._tokenExpiry) return true;
    return Date.now() >= this._tokenExpiry;
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