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

// Storage key for persisting theme preference
const THEME_STORAGE_KEY = 'themeMode';

// Create context
const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
  isDarkMode: false,
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
 * Get initial theme mode from localStorage or system preference
 * @returns {string} 'light' or 'dark'
 */
function getInitialMode() {
  // First check localStorage
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (e) {
    // Ignore storage errors
  }

  // Fall back to system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }

  return 'light';
}

/**
 * Theme Context Provider
 * Wraps the application with MUI ThemeProvider and provides theme switching functionality
 */
export function ThemeContextProvider({ children }) {
  const [mode, setModeState] = useState(getInitialMode);

  // Persist theme preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      // Ignore storage errors
    }
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };

    // Add listener (use addEventListener for modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setModeState((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  // Set mode directly
  const setMode = useCallback((newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setModeState(newMode);
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
    }),
    [mode, toggleTheme, setMode]
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

