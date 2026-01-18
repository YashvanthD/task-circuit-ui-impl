/**
 * User Utilities Index
 * Re-exports all user-related utilities from sub-modules.
 *
 * @module utils/user
 */

// Import all modules first
import cacheUtils from './cache';
import settingsUtils from './settings';
import profileUtils from './profile';
import managementUtils from './management';

// Cache utilities
export {
  readUsersCache,
  writeUsersCache,
  clearUsersCache,
  getSession,
  updateSession,
  getSettingsFromCache,
  updateSettingsInCache,
} from './cache';

// Settings utilities
export {
  getUserSettings,
  updateUserSettings,
  getThemeSettings,
  updateThemeSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getTimezoneSettings,
  updateTimezoneSettings,
} from './settings';

// Profile utilities
export {
  normalizeUserData,
  refreshUserSession,
  getCurrentUser,
  updateUserEmail,
  updateUserMobile,
  updateUserPassword,
  updateUsername,
  uploadProfilePicture,
  updateProfileDescription,
} from './profile';

// User management utilities
export {
  fetchUsers,
  getUserByKey,
  getUserName,
  getUserInfo,
  listAccountUsers,
  addUser,
  updateUser,
  deleteUser,
} from './management';

// Default export with all functions grouped

const userUtil = {
  // Cache
  ...cacheUtils,
  // Settings - main functions
  getUserSettings: settingsUtils.getUserSettings,
  updateUserSettings: settingsUtils.updateUserSettings,
  // Settings - sub functions (theme)
  getThemeSettings: settingsUtils.getThemeSettings,
  updateThemeSettings: settingsUtils.updateThemeSettings,
  // Settings - sub functions (notifications)
  getNotificationSettings: settingsUtils.getNotificationSettings,
  updateNotificationSettings: settingsUtils.updateNotificationSettings,
  // Settings - sub functions (timezone)
  getTimezoneSettings: settingsUtils.getTimezoneSettings,
  updateTimezoneSettings: settingsUtils.updateTimezoneSettings,
  // Profile
  normalizeUserData: profileUtils.normalizeUserData,
  refreshUserSession: profileUtils.refreshUserSession,
  getCurrentUser: profileUtils.getCurrentUser,
  updateUserEmail: profileUtils.updateUserEmail,
  updateUserMobile: profileUtils.updateUserMobile,
  updateUserPassword: profileUtils.updateUserPassword,
  updateUsername: profileUtils.updateUsername,
  uploadProfilePicture: profileUtils.uploadProfilePicture,
  updateProfileDescription: profileUtils.updateProfileDescription,
  // User management
  fetchUsers: managementUtils.fetchUsers,
  getUserByKey: managementUtils.getUserByKey,
  getUserName: managementUtils.getUserName,
  getUserInfo: managementUtils.getUserInfo,
  listAccountUsers: managementUtils.listAccountUsers,
  addUser: managementUtils.addUser,
  updateUser: managementUtils.updateUser,
  deleteUser: managementUtils.deleteUser,
  clearUsersCache: managementUtils.clearUsersCache,
};

export default userUtil;

