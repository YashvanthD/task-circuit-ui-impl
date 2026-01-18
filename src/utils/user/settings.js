/**
 * User Settings Utilities
 * Handles user settings (theme, notifications, etc.).
 *
 * @module utils/user/settings
 */

import { userApi } from '../../api';
import { getSettingsFromCache, updateSettingsInCache } from './cache';

/**
 * Simple logError function
 */
function logError(context, error) {
  console.error(`[${context}]`, error);
}

/**
 * Parse response and extract JSON data.
 */
async function parseResponse(res) {
  if (!res) return null;
  if (res.json && typeof res.json === 'function') {
    try {
      return await res.json();
    } catch (e) {
      return res;
    }
  }
  return res;
}

/**
 * Update settings cache (tc_user_session and userSession singleton).
 * @param {object} settings - Settings to merge into cache
 */
function updateSettingsCache(settings) {
  if (!settings) return;

  // Update userSession singleton
  try {
    const { userSession } = require('../auth/userSession');
    userSession.updateSettings(settings);
  } catch (e) { /* ignore */ }

  // Update tc_user_session in localStorage
  updateSettingsInCache(settings);
}

// ============================================================================
// Main Settings Functions (API + Cache)
// ============================================================================

/**
 * Get user settings from cache or API.
 * @param {boolean} forceApi - Force API call, skip cache
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function getUserSettings(forceApi = false) {
  // Try cache first (tc_user_session)
  if (!forceApi) {
    const cached = getSettingsFromCache();
    if (cached && Object.keys(cached).length > 0) {
      return cached;
    }
  }

  // Fetch from API
  try {
    const res = await userApi.getSettings();
    const data = await parseResponse(res);
    const settings = data?.data?.settings || data?.settings || data?.data || data;

    // Update cache with fetched settings
    if (settings) {
      updateSettingsCache(settings);
    }

    return settings || {};
  } catch (e) {
    logError('getUserSettings', e);
    // Return cached settings on error
    const cached = getSettingsFromCache();
    if (cached) return cached;
    throw e;
  }
}

/**
 * Update user settings (main function - handles API call and cache update).
 * @param {object} settings - Settings to update (e.g., {theme: 'dark', timezone: 'UTC'})
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateUserSettings(settings) {
  try {
    // API call: {settings: {...}}
    const res = await userApi.updateSettings({ settings });
    const data = await parseResponse(res);

    // Update cache
    updateSettingsCache(settings);

    return data;
  } catch (e) {
    logError('updateUserSettings', e);
    throw e;
  }
}

// ============================================================================
// Theme Settings (Sub-functions)
// ============================================================================

/**
 * Get theme from settings.
 * @returns {Promise<string>} 'light' or 'dark'
 */
export async function getThemeSettings() {
  const settings = await getUserSettings();
  return settings?.theme || 'light';
}

/**
 * Update theme settings.
 * @param {string} theme - Theme mode ('light' or 'dark')
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateThemeSettings(theme) {
  try {
    // Call main settings update function
    const result = await updateUserSettings({ theme });

    // Also update themeMode in localStorage for backward compatibility
    try {
      localStorage.setItem('themeMode', theme);
    } catch (e) { /* ignore */ }

    return result;
  } catch (e) {
    // Still update localStorage even if API fails
    try {
      localStorage.setItem('themeMode', theme);
      updateSettingsCache({ theme });
    } catch (e) { /* ignore */ }
    throw e;
  }
}

// ============================================================================
// Notification Settings (Sub-functions)
// ============================================================================

/**
 * Get notification settings.
 * @returns {Promise<object>} Notification settings
 */
export async function getNotificationSettings() {
  const settings = await getUserSettings();
  return settings?.notifications || {};
}

/**
 * Update notification settings.
 * @param {object} notificationSettings - Notification settings to update
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateNotificationSettings(notificationSettings) {
  // Call main settings update function
  return updateUserSettings({ notifications: notificationSettings });
}

// ============================================================================
// Timezone Settings (Sub-functions)
// ============================================================================

/**
 * Get timezone from settings.
 * @returns {Promise<string>} Timezone string
 */
export async function getTimezoneSettings() {
  const settings = await getUserSettings();
  return settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Update timezone settings.
 * @param {string} timezone - Timezone string (e.g., 'Asia/Kolkata')
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateTimezoneSettings(timezone) {
  return updateUserSettings({ timezone });
}

export default {
  // Main functions
  getUserSettings,
  updateUserSettings,
  // Theme
  getThemeSettings,
  updateThemeSettings,
  // Notifications
  getNotificationSettings,
  updateNotificationSettings,
  // Timezone
  getTimezoneSettings,
  updateTimezoneSettings,
};

