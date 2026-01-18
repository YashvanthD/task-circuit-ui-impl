/**
 * DataContext
 * React context for accessing cached entity data throughout the app.
 * Provides hooks for users, ponds, fish, samplings, and tasks.
 *
 * @module contexts/DataContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Import entity caches
import {
  getUsers, refreshUsers, getUsersSync, isUsersLoading, getUsersError,
  getUserById, getUserOptions, getUsersByRole, getActiveUsers, onUsersChange,
} from '../utils/cache';

import {
  getPonds, refreshPonds, getPondsSync, isPondsLoading, getPondsError,
  getPondById, getPondOptions, getPondsByStatus, getActivePonds, getPondName, onPondsChange,
} from '../utils/cache';

import {
  getFish, refreshFish, getFishSync, isFishLoading, getFishError,
  getFishById, getFishOptions, getFishByPond, getFishByStatus, getActiveFish, getFishName, onFishChange,
} from '../utils/cache';

import {
  getSamplings, refreshSamplings, getSamplingsSync, isSamplingsLoading, getSamplingsError,
  getSamplingById, getSamplingOptions, getSamplingsByPond, getSamplingsByStatus, onSamplingsChange,
} from '../utils/cache/samplingsCache';

import {
  getTasks, refreshTasks, getTasksSync, isTasksLoading, getTasksError,
  getTaskById, getTaskOptions, getTasksByStatus, getTasksByUser, getTaskCounts, onTasksChange,
} from '../utils/cache/tasksCache';

import {
  getNotifications, refreshNotifications, getNotificationsSync, isNotificationsLoading, getNotificationsError,
  getNotificationById, getUnreadNotifications, getRecentNotifications, getUnreadNotificationCount,
  markNotificationAsRead, deleteNotification, markAllNotificationsAsRead,
  onNotificationsChange,
} from '../utils/cache/notificationsCache';

import {
  getAlerts, refreshAlerts, getAlertsSync, isAlertsLoading, getAlertsError,
  getAlertById, getUnacknowledgedAlerts, getCriticalAlerts, getUnacknowledgedAlertCount,
  acknowledgeAlert, deleteAlert,
  onAlertsChange,
} from '../utils/cache/alertsCache';

import { subscribeAllToWebSocket } from '../utils/cache';
import { initializeWebSocket, isConnected as isWSConnected } from '../utils/websocket';

// Load notification sound path (hosted URL)
// const NOTIFICATION_SOUND = 'https://github.com/YashvanthD/assets/raw/1cdabc6b7877beda9a0a8d62722f74e2cf2231bf/sounds/notification.mp3';
const NOTIFICATION_SOUND = '/task-circuit-ui-impl/sounds/notification.mp3';

// ============================================================================
// Context
// ============================================================================
const DataContext = createContext(null);

// ============================================================================
// Provider Component
// ============================================================================

/**
 * DataProvider - Wraps the app to provide data context with caching.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export function DataProvider({ children }) {
  // Force re-render when caches update
  const [, forceUpdate] = useState(0);

  // Subscribe to all cache changes
  useEffect(() => {
    const rerender = () => forceUpdate((n) => n + 1);

    const unsubs = [
      onUsersChange('updated', rerender),
      onPondsChange('updated', rerender),
      onFishChange('updated', rerender),
      onSamplingsChange('updated', rerender),
      onTasksChange('updated', rerender),
      onNotificationsChange('updated', rerender),
      onAlertsChange('updated', rerender),
    ];

    // Also listen for new notifications to play a sound
    let unsubNewNotification = null;
    try {
      unsubNewNotification = onNotificationsChange('new', (notification) => {
        try {
          // Play sound for new notifications if running in browser
          if (typeof window !== 'undefined' && document) {
            const audio = new Audio(NOTIFICATION_SOUND);
            // Don't await play to avoid blocking; browsers may prevent autoplay
            audio.play().catch(() => {
              // Autoplay prevented or other error - ignore silently
            });
          }
        } catch (e) {
          // Ignore audio errors
          console.warn('[DataContext] Failed to play notification sound:', e);
        }
      });
    } catch (e) {
      // If subscription fails, continue without sound
    }

    // Initial load of notifications and alerts for authenticated users
    // Check if user is authenticated (has token)
    const token = localStorage.getItem('access_token');
    if (token) {
      // Connect WebSocket for real-time updates using centralized wsManager
      (async () => {
        try {
          const connected = await initializeWebSocket();
          if (connected) {
            // Subscribe all caches to WebSocket events
            subscribeAllToWebSocket();
          }
        } catch (e) {
          console.warn('[DataContext] WebSocket connection failed:', e);
        }
      })();

      // Load in background, don't block
      getNotifications().catch(() => {});
      getAlerts().catch(() => {});
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
      if (typeof unsubNewNotification === 'function') unsubNewNotification();
    };
  }, []);

  const value = {
    // Users
    users: getUsersSync(),
    usersLoading: isUsersLoading(),
    usersError: getUsersError(),
    loadUsers: getUsers,
    refreshUsers,
    getUserById,
    getUserOptions,
    getUsersByRole,
    getActiveUsers,

    // Ponds
    ponds: getPondsSync(),
    pondsLoading: isPondsLoading(),
    pondsError: getPondsError(),
    loadPonds: getPonds,
    refreshPonds,
    getPondById,
    getPondOptions,
    getPondsByStatus,
    getActivePonds,
    getPondName,

    // Fish
    fish: getFishSync(),
    fishLoading: isFishLoading(),
    fishError: getFishError(),
    loadFish: getFish,
    refreshFish,
    getFishById,
    getFishOptions,
    getFishByPond,
    getFishByStatus,
    getActiveFish,
    getFishName,

    // Samplings
    samplings: getSamplingsSync(),
    samplingsLoading: isSamplingsLoading(),
    samplingsError: getSamplingsError(),
    loadSamplings: getSamplings,
    refreshSamplings,
    getSamplingById,
    getSamplingOptions,
    getSamplingsByPond,
    getSamplingsByStatus,

    // Tasks
    tasks: getTasksSync(),
    tasksLoading: isTasksLoading(),
    tasksError: getTasksError(),
    loadTasks: getTasks,
    refreshTasks,
    getTaskById,
    getTaskOptions,
    getTasksByStatus,
    getTasksByUser,
    getTaskCounts,

    // Notifications
    notifications: getNotificationsSync(),
    notificationsLoading: isNotificationsLoading(),
    notificationsError: getNotificationsError(),
    loadNotifications: getNotifications,
    refreshNotifications,
    getNotificationById,
    getUnreadNotifications,
    getRecentNotifications,
    unreadNotificationCount: getUnreadNotificationCount(),
    markNotificationAsRead,
    deleteNotification,
    markAllNotificationsAsRead,

    // Alerts
    alerts: getAlertsSync(),
    alertsLoading: isAlertsLoading(),
    alertsError: getAlertsError(),
    loadAlerts: getAlerts,
    refreshAlerts,
    getAlertById,
    getUnacknowledgedAlerts,
    getCriticalAlerts,
    unacknowledgedAlertCount: getUnacknowledgedAlertCount(),
    acknowledgeAlert,
    deleteAlert,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * useData - Hook to access all cached data.
 * @returns {object} Data context value
 * @throws {Error} If used outside DataProvider
 */
export function useData() {
  const context = useContext(DataContext);
  if (context === null) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// ============================================================================
// Entity-Specific Hooks
// ============================================================================

/**
 * useUsers - Hook for users data.
 * @returns {object} Users data and functions
 */
export function useUsers() {
  const [users, setUsers] = useState(getUsersSync);
  const [loading, setLoading] = useState(isUsersLoading);
  const [error, setError] = useState(getUsersError);

  useEffect(() => {
    const unsubUpdated = onUsersChange('updated', (data) => setUsers(data));
    const unsubLoading = onUsersChange('loading', (val) => setLoading(val));
    const unsubError = onUsersChange('error', (err) => setError(err));

    return () => {
      unsubUpdated();
      unsubLoading();
      unsubError();
    };
  }, []);

  const load = useCallback((force = false) => getUsers(force), []);
  const refresh = useCallback(() => refreshUsers(), []);

  return {
    users,
    loading,
    error,
    load,
    refresh,
    getById: getUserById,
    getOptions: getUserOptions,
    getByRole: getUsersByRole,
    getActive: getActiveUsers,
  };
}

/**
 * usePonds - Hook for ponds data.
 * @returns {object} Ponds data and functions
 */
export function usePonds() {
  const [ponds, setPonds] = useState(getPondsSync);
  const [loading, setLoading] = useState(isPondsLoading);
  const [error, setError] = useState(getPondsError);

  useEffect(() => {
    const unsubUpdated = onPondsChange('updated', (data) => setPonds(data));
    const unsubLoading = onPondsChange('loading', (val) => setLoading(val));
    const unsubError = onPondsChange('error', (err) => setError(err));

    return () => {
      unsubUpdated();
      unsubLoading();
      unsubError();
    };
  }, []);

  const load = useCallback((force = false) => getPonds(force), []);
  const refresh = useCallback(() => refreshPonds(), []);

  return {
    ponds,
    loading,
    error,
    load,
    refresh,
    getById: getPondById,
    getOptions: getPondOptions,
    getByStatus: getPondsByStatus,
    getActive: getActivePonds,
    getName: getPondName,
  };
}

/**
 * useFish - Hook for fish data.
 * @returns {object} Fish data and functions
 */
export function useFish() {
  const [fish, setFish] = useState(getFishSync);
  const [loading, setLoading] = useState(isFishLoading);
  const [error, setError] = useState(getFishError);

  useEffect(() => {
    const unsubUpdated = onFishChange('updated', (data) => setFish(data));
    const unsubLoading = onFishChange('loading', (val) => setLoading(val));
    const unsubError = onFishChange('error', (err) => setError(err));

    return () => {
      unsubUpdated();
      unsubLoading();
      unsubError();
    };
  }, []);

  const load = useCallback((force = false) => getFish(force), []);
  const refresh = useCallback(() => refreshFish(), []);

  return {
    fish,
    loading,
    error,
    load,
    refresh,
    getById: getFishById,
    getOptions: getFishOptions,
    getByPond: getFishByPond,
    getByStatus: getFishByStatus,
    getActive: getActiveFish,
    getName: getFishName,
  };
}

/**
 * useSamplings - Hook for samplings data.
 * @returns {object} Samplings data and functions
 */
export function useSamplings() {
  const [samplings, setSamplings] = useState(getSamplingsSync);
  const [loading, setLoading] = useState(isSamplingsLoading);
  const [error, setError] = useState(getSamplingsError);

  useEffect(() => {
    const unsubUpdated = onSamplingsChange('updated', (data) => setSamplings(data));
    const unsubLoading = onSamplingsChange('loading', (val) => setLoading(val));
    const unsubError = onSamplingsChange('error', (err) => setError(err));

    return () => {
      unsubUpdated();
      unsubLoading();
      unsubError();
    };
  }, []);

  const load = useCallback((force = false) => getSamplings(force), []);
  const refresh = useCallback(() => refreshSamplings(), []);

  return {
    samplings,
    loading,
    error,
    load,
    refresh,
    getById: getSamplingById,
    getOptions: getSamplingOptions,
    getByPond: getSamplingsByPond,
    getByStatus: getSamplingsByStatus,
  };
}

/**
 * useTasks - Hook for tasks data.
 * @returns {object} Tasks data and functions
 */
export function useTasks() {
  const [tasks, setTasks] = useState(getTasksSync);
  const [loading, setLoading] = useState(isTasksLoading);
  const [error, setError] = useState(getTasksError);

  useEffect(() => {
    const unsubUpdated = onTasksChange('updated', (data) => setTasks(data));
    const unsubLoading = onTasksChange('loading', (val) => setLoading(val));
    const unsubError = onTasksChange('error', (err) => setError(err));

    return () => {
      unsubUpdated();
      unsubLoading();
      unsubError();
    };
  }, []);

  const load = useCallback((force = false) => getTasks(force), []);
  const refresh = useCallback(() => refreshTasks(), []);

  return {
    tasks,
    loading,
    error,
    load,
    refresh,
    getById: getTaskById,
    getOptions: getTaskOptions,
    getByStatus: getTasksByStatus,
    getByUser: getTasksByUser,
    getCounts: getTaskCounts,
  };
}

/**
 * useNotifications - Hook for notifications data.
 * @returns {object} Notifications data and functions
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState(getNotificationsSync);
  const [loading, setLoading] = useState(isNotificationsLoading);
  const [error, setError] = useState(getNotificationsError);
  const [unreadCount, setUnreadCount] = useState(getUnreadNotificationCount);

  useEffect(() => {
    const unsubUpdated = onNotificationsChange('updated', (data) => {
      setNotifications(data);
      setUnreadCount(getUnreadNotificationCount());
    });
    const unsubLoading = onNotificationsChange('loading', (val) => setLoading(val));
    const unsubError = onNotificationsChange('error', (err) => setError(err));

    return () => {
      unsubUpdated();
      unsubLoading();
      unsubError();
    };
  }, []);

  const load = useCallback((force = false) => getNotifications(force), []);
  const refresh = useCallback(() => refreshNotifications(), []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    load,
    refresh,
    getById: getNotificationById,
    getUnread: getUnreadNotifications,
    getRecent: getRecentNotifications,
    markAsRead: markNotificationAsRead,
    delete: deleteNotification,
    markAllRead: markAllNotificationsAsRead,
  };
}

/**
 * useAlerts - Hook for alerts data.
 * @returns {object} Alerts data and functions
 */
export function useAlerts() {
  const [alerts, setAlerts] = useState(getAlertsSync);
  const [loading, setLoading] = useState(isAlertsLoading);
  const [error, setError] = useState(getAlertsError);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(getUnacknowledgedAlertCount);

  useEffect(() => {
    const unsubUpdated = onAlertsChange('updated', (data) => {
      setAlerts(data);
      setUnacknowledgedCount(getUnacknowledgedAlertCount());
    });
    const unsubLoading = onAlertsChange('loading', (val) => setLoading(val));
    const unsubError = onAlertsChange('error', (err) => setError(err));

    return () => {
      unsubUpdated();
      unsubLoading();
      unsubError();
    };
  }, []);

  const load = useCallback((force = false) => getAlerts(force), []);
  const refresh = useCallback(() => refreshAlerts(), []);

  return {
    alerts,
    loading,
    error,
    unacknowledgedCount,
    load,
    refresh,
    getById: getAlertById,
    getUnacknowledged: getUnacknowledgedAlerts,
    getCritical: getCriticalAlerts,
    acknowledge: acknowledgeAlert,
    delete: deleteAlert,
  };
}

// ============================================================================
// Export
// ============================================================================
export default DataContext;

