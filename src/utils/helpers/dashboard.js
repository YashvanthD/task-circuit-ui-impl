/**
 * Dashboard Utilities
 * Helper functions for dashboard data management and refresh.
 *
 * @module utils/helpers/dashboard
 */

import { refreshNotifications } from '../cache/notificationsCache';
import { refreshAlerts } from '../cache/alertsCache';
import { refreshTasks } from '../cache/tasksCache';
import { refreshPonds } from '../cache/pondsCache';
import { refreshSamplings } from '../cache/samplingsCache';

// ============================================================================
// Dashboard Refresh Functions
// ============================================================================

/**
 * Refresh all dashboard data (notifications, alerts, tasks, etc.)
 * @returns {Promise<object>} Result with success status and any errors
 */
export async function refreshDashboardData() {
  const results = {
    success: true,
    errors: [],
    refreshed: [],
  };

  const refreshers = [
    { name: 'notifications', fn: refreshNotifications },
    { name: 'alerts', fn: refreshAlerts },
    { name: 'tasks', fn: refreshTasks },
  ];

  await Promise.all(
    refreshers.map(async ({ name, fn }) => {
      try {
        await fn();
        results.refreshed.push(name);
      } catch (error) {
        results.errors.push({ name, error: error.message });
        results.success = false;
      }
    })
  );

  return results;
}

/**
 * Refresh all data including analytics (ponds, samplings, etc.)
 * @returns {Promise<object>} Result with success status and any errors
 */
export async function refreshAllDashboardData() {
  const results = {
    success: true,
    errors: [],
    refreshed: [],
  };

  const refreshers = [
    { name: 'notifications', fn: refreshNotifications },
    { name: 'alerts', fn: refreshAlerts },
    { name: 'tasks', fn: refreshTasks },
    { name: 'ponds', fn: refreshPonds },
    { name: 'samplings', fn: refreshSamplings },
  ];

  await Promise.all(
    refreshers.map(async ({ name, fn }) => {
      try {
        await fn();
        results.refreshed.push(name);
      } catch (error) {
        results.errors.push({ name, error: error.message });
        results.success = false;
      }
    })
  );

  return results;
}

/**
 * Refresh only notifications and alerts
 * @returns {Promise<object>} Result with success status
 */
export async function refreshNotificationsAndAlerts() {
  const results = {
    success: true,
    errors: [],
  };

  try {
    await Promise.all([
      refreshNotifications(),
      refreshAlerts(),
    ]);
  } catch (error) {
    results.success = false;
    results.errors.push(error.message);
  }

  return results;
}

// ============================================================================
// Export
// ============================================================================

const dashboardHelpers = {
  refreshDashboardData,
  refreshAllDashboardData,
  refreshNotificationsAndAlerts,
};

export default dashboardHelpers;

