/**
 * UserContext
 * React context for accessing user session data throughout the app.
 * Wraps the UserSession singleton and provides React hooks.
 *
 * @module contexts/UserContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userSession } from '../utils/auth/userSession';

// ============================================================================
// Context
// ============================================================================
const UserContext = createContext(null);

// ============================================================================
// Provider Component
// ============================================================================

/**
 * UserProvider - Wraps the app to provide user context.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export function UserProvider({ children }) {
  const [sessionState, setSessionState] = useState(() => userSession.getSnapshot());
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to session changes
  useEffect(() => {
    const unsubscribe = userSession.on('change', (snapshot) => {
      setSessionState(snapshot || {
        isAuthenticated: false,
        isAdmin: false,
        isManager: false,
        user: null,
        settings: null,
        permissions: null,
        account: null,
        tokenExpiry: null,
      });
    });

    return unsubscribe;
  }, []);

  // Login handler
  const login = useCallback(async (loginResponse) => {
    setIsLoading(true);
    try {
      userSession.initFromLoginResponse(loginResponse);
      setSessionState(userSession.getSnapshot());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    userSession.logout();
    setSessionState({
      isAuthenticated: false,
      isAdmin: false,
      isManager: false,
      user: null,
      settings: null,
      permissions: null,
      account: null,
      tokenExpiry: null,
    });
  }, []);

  // Update settings
  const updateSettings = useCallback((settings) => {
    userSession.updateSettings(settings);
  }, []);

  // Update profile
  const updateProfile = useCallback((profileData) => {
    userSession.updateProfile(profileData);
  }, []);

  // Check role
  const hasRole = useCallback((role) => {
    return userSession.hasRole(role);
  }, []);

  // Check any roles
  const hasAnyRole = useCallback((roles) => {
    return userSession.hasAnyRole(roles);
  }, []);

  const value = {
    // State
    ...sessionState,
    isLoading,

    // Direct accessors
    userKey: userSession.userKey,
    username: userSession.username,
    email: userSession.email,
    displayName: userSession.displayName,
    accountKey: userSession.accountKey,
    roles: userSession.roles,
    profilePhoto: userSession.profilePhoto,
    accessToken: userSession.accessToken,

    // Actions
    login,
    logout,
    updateSettings,
    updateProfile,

    // Utilities
    hasRole,
    hasAnyRole,

    // Direct session access (for advanced use)
    session: userSession,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * useUser - Hook to access user context.
 * @returns {object} User context value
 * @throws {Error} If used outside UserProvider
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

/**
 * useAuth - Hook for authentication state only.
 * @returns {object} Auth state { isAuthenticated, isLoading, login, logout }
 */
export function useAuth() {
  const { isAuthenticated, isLoading, login, logout, accessToken } = useUser();
  return { isAuthenticated, isLoading, login, logout, accessToken };
}

/**
 * useUserProfile - Hook for user profile data only.
 * @returns {object} Profile data
 */
export function useUserProfile() {
  const {
    user,
    userKey,
    username,
    email,
    displayName,
    profilePhoto,
    accountKey,
    roles,
    updateProfile,
  } = useUser();

  return {
    user,
    userKey,
    username,
    email,
    displayName,
    profilePhoto,
    accountKey,
    roles,
    updateProfile,
  };
}

/**
 * useUserSettings - Hook for user settings only.
 * @returns {object} Settings data and updater
 */
export function useUserSettings() {
  const { settings, updateSettings } = useUser();
  return { settings, updateSettings };
}

/**
 * useUserPermissions - Hook for permissions and roles.
 * @returns {object} Permissions data and role checkers
 */
export function useUserPermissions() {
  const { permissions, roles, isAdmin, isManager, hasRole, hasAnyRole } = useUser();
  return { permissions, roles, isAdmin, isManager, hasRole, hasAnyRole };
}

// ============================================================================
// Export
// ============================================================================
export default UserContext;

