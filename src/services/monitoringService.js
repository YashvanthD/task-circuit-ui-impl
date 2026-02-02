/**
 * Monitoring Service
 * Aggregates data for the Pond Monitoring Dashboard and handles daily logging
 *
 * @module services/monitoringService
 */

import { fetchPonds } from './pondService';
import { fetchStocks } from './stockService';
import { apiFetch } from '../api';
import { API_FISH, API_TASK } from '../api/constants';
import { addDailyUpdate } from '../api/pond';
import { Stock } from '../models';

/**
 * Fetch all data required for the monitoring dashboard
 * Aggregates ponds, their current stocks, and pending tasks
 */
export async function fetchMonitoringDashboardData() {
  try {
    // 1. Fetch all ponds and stocks in parallel
    const [ponds, allStocks] = await Promise.all([
      fetchPonds(),
      fetchStocks({ status: 'active' })
    ]);

    // 2. Fetch pending tasks (simplified - in real app might filter by pond)
    let pendingTasks = [];
    try {
      const taskRes = await apiFetch(API_TASK.MY_PENDING);
      const taskData = await taskRes.json();
      pendingTasks = taskData.data || taskData.tasks || (Array.isArray(taskData) ? taskData : []);
    } catch (err) {
      console.warn('[monitoringService] Failed to fetch tasks:', err);
    }

    // 3. Enrich ponds with stock and task data
    const enrichedPonds = ponds.map(pond => {
      // Find current stock for this pond
      const currentStock = allStocks.find(s =>
        (pond.current_stock_id && s.stock_id === pond.current_stock_id) ||
        (s.pond_id === pond.pond_id && s.status === 'active')
      );

      // Filter tasks related to this pond
      const pondTasks = pendingTasks.filter(t => t.pond_id === pond.pond_id || t.metadata?.pond_id === pond.pond_id);

      // Calculate analytics if stock exists
      let analytics = null;
      if (currentStock) {
        // Ensure currentStock is a Stock model instance
        const stockModel = currentStock instanceof Stock ? currentStock : new Stock(currentStock);
        analytics = stockModel.getAnalytics(stockModel.current_avg_weight_g);
      }

      // Add monitoring specific properties
      return {
        ...pond,
        stock: currentStock || null,
        analytics,
        tasks: pondTasks.map(t => ({
          id: t.task_id || t.id,
          title: t.title || t.description,
          completed: t.status === 'completed',
          dueTime: t.due_date ? new Date(t.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          overdue: t.due_date ? new Date(t.due_date) < new Date() && t.status !== 'completed' : false
        })),
        health: {
          status: _calculatePondHealth(pond, currentStock),
          issues: pond.metadata?.active_issues || []
        }
      };
    });

    return enrichedPonds;
  } catch (error) {
    console.error('[monitoringService] Failed to fetch dashboard data:', error);
    throw error;
  }
}

/**
 * Save a daily log entry for a pond
 * Integrates feeding, water quality, and observations
 */
export async function saveDailyLog(pondId, logData) {
  try {
    // Transform UX form data to API payload
    const payload = {
      log_date: logData.log_date,
      log_time: logData.log_time,

      // Water Quality
      water_quality: {
        temperature: logData.temperature ? parseFloat(logData.temperature) : null,
        ph: logData.ph ? parseFloat(logData.ph) : null,
        dissolved_oxygen: logData.dissolved_oxygen ? parseFloat(logData.dissolved_oxygen) : null,
      },

      // Feeding
      feeding: {
        time_slot: logData.time_slot,
        amount_kg: logData.amount_kg ? parseFloat(logData.amount_kg) : 0,
        behavior: logData.feeding_behavior
      },

      // Observations & Issues
      observations: logData.observations,
      has_issues: logData.has_issues,
      issue_details: logData.has_issues ? {
        type: logData.issue_type,
        description: logData.issue_description,
        photos: logData.issue_photos
      } : null
    };

    const res = await addDailyUpdate(pondId, payload);
    const data = await res.json();

    return {
      success: res.ok && data.success,
      data: data.data,
      error: data.error
    };
  } catch (error) {
    console.error('[monitoringService] Failed to save daily log:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch detailed history for a specific pond (for charts and detailed view)
 */
export async function fetchPondHistory(pondId) {
  try {
    const [samplingsRes, feedingsRes, waterQualityRes] = await Promise.all([
      apiFetch(`${API_FISH.SAMPLINGS}?pond_id=${pondId}&limit=20`),
      apiFetch(`${API_FISH.FEEDINGS}?pond_id=${pondId}&limit=20`),
      apiFetch(`/api/fish/ponds/${pondId}/water-quality?limit=20`)
    ]);

    const [samplings, feedings, wqHistory] = await Promise.all([
      samplingsRes.json(),
      feedingsRes.json(),
      waterQualityRes.json()
    ]);

    return {
      samplings: samplings.data?.samplings || samplings.samplings || [],
      feedings: feedings.data?.feedings || feedings.feedings || [],
      waterQuality: wqHistory.data || wqHistory || []
    };
  } catch (error) {
    console.error('[monitoringService] Failed to fetch pond history:', error);
    return { samplings: [], feedings: [], waterQuality: [] };
  }
}

/**
 * Internal helper to determine pond health status based on WQ and Stock
 * @private
 */
function _calculatePondHealth(pond, stock) {
  if (pond.status === 'empty') return 'unknown';

  // Example logic: if DO is low or pH is out of range
  const wq = pond.water_quality || {};
  if (wq.dissolved_oxygen < 4 || wq.ph < 6 || wq.ph > 9) return 'critical';
  if (wq.dissolved_oxygen < 5 || wq.ph < 6.5 || wq.ph > 8.5) return 'attention';

  return 'healthy';
}
