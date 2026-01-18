/**
 * Theme Context
 * Provides theme mode state management across the application
 *
 * @module contexts/ThemeContext
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '../theme';
import { updateThemeSettings } from '../utils/user';

// Storage key for persisting theme preference
const THEME_STORAGE_KEY = 'themeMode';
const SESSION_STORAGE_KEY = 'tc_user_session';

// Create context
const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
  isDarkMode: false,
  loading: false,
  resetToDefault: () => {},
});

/**
 * Hook to access theme context
 * @returns {object} Theme context value
 */
export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeContextProvider');
  }
  return context;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  try {
    return !!localStorage.getItem('access_token');
  } catch (e) {
    return false;
  }
}

/**
 * Get theme from tc_user_session
 * @returns {string|null}
 */
function getThemeFromSession() {
  try {
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      const theme = session?.settings?.theme;
      if (theme === 'light' || theme === 'dark') {
        return theme;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
}

/**
 * Update theme in tc_user_session
 * @param {string} theme
 */
function updateThemeInSession(theme) {
  try {
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (!session.settings) {
        session.settings = {};
      }
      session.settings.theme = theme;
      session.updatedAt = Date.now();
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.warn('[ThemeContext] Failed to update session:', e);
  }
}

/**
 * Get initial theme mode
 * - Non-authenticated: always light
 * - Authenticated: from tc_user_session settings or light
 * @returns {string} 'light' or 'dark'
 */
function getInitialMode() {
  // If not authenticated, always use light theme
  if (!isAuthenticated()) {
    return 'light';
  }

  // For authenticated users, check tc_user_session first
  const sessionTheme = getThemeFromSession();
  if (sessionTheme) {
    return sessionTheme;
  }

  // Fallback to themeMode in localStorage
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (e) {
    // Ignore storage errors
  }

  // Default to light
  return 'light';
}

/**
 * Theme Context Provider
 * Wraps the application with MUI ThemeProvider and provides theme switching functionality
 */
export function ThemeContextProvider({ children }) {
  const [mode, setModeState] = useState(getInitialMode);
  const [loading, setLoading] = useState(false);

  // Refresh theme from session - call this after login
  const refreshFromSession = useCallback(() => {
    if (isAuthenticated()) {
      const sessionTheme = getThemeFromSession();
      if (sessionTheme && sessionTheme !== mode) {
        console.log('[ThemeContext] Refreshing theme from session:', sessionTheme);
        setModeState(sessionTheme);
      }
    } else {
      setModeState('light');
    }
  }, [mode]);

  // Check for session changes periodically (handles same-tab login)
  useEffect(() => {
    let lastSessionStr = localStorage.getItem(SESSION_STORAGE_KEY);

    const checkSession = () => {
      const currentSessionStr = localStorage.getItem(SESSION_STORAGE_KEY);

      // Session changed
      if (currentSessionStr !== lastSessionStr) {
        lastSessionStr = currentSessionStr;

        if (currentSessionStr && isAuthenticated()) {
          try {
            const session = JSON.parse(currentSessionStr);
            const theme = session?.settings?.theme;
            if (theme === 'light' || theme === 'dark') {
              setModeState(theme);
            }
          } catch (e) {
            // Ignore parse errors
          }
        } else if (!isAuthenticated()) {
          // Logged out
          setModeState('light');
        }
      }
    };

    // Check every 500ms for session changes
    const interval = setInterval(checkSession, 500);

    return () => clearInterval(interval);
  }, []);

  // Listen for session changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'access_token') {
        if (!e.newValue) {
          // Token was removed (logout) - reset to light theme
          setModeState('light');
          localStorage.removeItem(THEME_STORAGE_KEY);
        } else {
          // Token was added (login) - load theme from session
          const sessionTheme = getThemeFromSession();
          if (sessionTheme) {
            setModeState(sessionTheme);
          }
        }
      }
      if (e.key === SESSION_STORAGE_KEY && e.newValue) {
        // Session was updated - check for theme change
        try {
          const session = JSON.parse(e.newValue);
          const theme = session?.settings?.theme;
          if (theme === 'light' || theme === 'dark') {
            setModeState(theme);
          }
        } catch (e) {
          // Ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync theme to localStorage when it changes (only if authenticated)
  useEffect(() => {
    if (isAuthenticated()) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, [mode]);

  // Reset to default light theme (called on logout)
  const resetToDefault = useCallback(() => {
    setModeState('light');
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  }, []);

  // Toggle between light and dark (with API sync)
  const toggleTheme = useCallback(async () => {
    // Only allow theme change if authenticated
    if (!isAuthenticated()) {
      console.warn('[ThemeContext] Cannot change theme when not authenticated');
      return;
    }

    const newMode = mode === 'light' ? 'dark' : 'light';
    setModeState(newMode);

    // Update session immediately
    updateThemeInSession(newMode);

    // Save to API in background
    try {
      await updateThemeSettings(newMode);
    } catch (e) {
      console.warn('[ThemeContext] Failed to save theme to API:', e);
      // Theme is already updated locally, so no need to revert
    }
  }, [mode]);

  // Set mode directly (with API sync)
  const setMode = useCallback(async (newMode) => {
    if (newMode !== 'light' && newMode !== 'dark') return;

    // Only allow theme change if authenticated
    if (!isAuthenticated()) {
      console.warn('[ThemeContext] Cannot change theme when not authenticated');
      return;
    }

    setModeState(newMode);

    // Update session immediately
    updateThemeInSession(newMode);

    // Save to API in background
    try {
      await updateThemeSettings(newMode);
    } catch (e) {
      console.warn('[ThemeContext] Failed to save theme to API:', e);
    }
  }, []);

  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(() => getTheme(mode), [mode]);

  // Context value
  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
      setMode,
      isDarkMode: mode === 'dark',
      loading,
      resetToDefault,
    }),
    [mode, toggleTheme, setMode, loading, resetToDefault]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeContext;

