/**
 * WebSocket Module Index
 * Export WebSocket service and utilities.
 *
 * @module utils/websocket
 */

// Core socket service (low-level)
export { socketService, WS_EVENTS, default } from './socketService';

// Centralized WebSocket Manager (use this for new code)
export {
  default as wsManager,
  initializeWebSocket,
  isConnected,
  subscribe as subscribeWS,
  unsubscribe as unsubscribeWS,
  emit as emitWS,
  disconnect as disconnectWS,
  reset as resetWS,
  notifications as wsNotifications,
  alerts as wsAlerts,
  chat as wsChat,
} from './wsManager';
