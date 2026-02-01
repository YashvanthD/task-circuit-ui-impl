/**
 * Entities Module Index
 * Export centralized entity management utilities
 *
 * @module utils/entities
 */

import  { entityManager } from './entityManager';
export { entityManager } from './entityManager';

// Convenience re-export of entity manager methods
export const {
  // Fish Farming
  getFarms,
  getFarm,
  getPonds,
  getPond,
  getSpecies,
  getStocks,
  getStock,

  // Farming Activities
  getFeedings,
  getSamplings,
  getHarvests,
  getMortalities,
  getTransfers,
  getTreatments,
  getMaintenance,
  getPurchases,

  // Media Service
  getAlerts,
  getAlert,
  getTasks,
  getTask,
  getNotifications,
  getConversations,
  getMessages,

  // User Management
  getUsers,
  getUser,

  // Utility
  clearEntityCache,
  clearAllCaches,
  on,
  emit,
} = entityManager;
