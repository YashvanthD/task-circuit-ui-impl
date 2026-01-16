/**
 * useWebSocket Hook
 * React hook for WebSocket connection status and events.
 *
 * @module hooks/useWebSocket
 */

import { useState, useEffect, useCallback } from 'react';
import { socketService, WS_EVENTS } from '../utils/websocket';

/**
 * Hook for WebSocket connection status
 * @returns {object} { connected, connect, disconnect }
 */
export function useWebSocketConnection() {
  const [connected, setConnected] = useState(socketService.isConnected());

  useEffect(() => {
    const unsubscribe = socketService.on('connection', ({ status }) => {
      setConnected(status === 'connected' || status === 'reconnected');
    });

    // Check initial state
    setConnected(socketService.isConnected());

    return unsubscribe;
  }, []);

  const connect = useCallback(() => socketService.connect(), []);
  const disconnect = useCallback(() => socketService.disconnect(), []);

  return { connected, connect, disconnect };
}

/**
 * Hook for listening to a specific WebSocket event
 * @param {string} event - Event name
 * @param {function} callback - Callback function
 */
export function useWebSocketEvent(event, callback) {
  useEffect(() => {
    if (!event || !callback) return;

    const unsubscribe = socketService.on(event, callback);
    return unsubscribe;
  }, [event, callback]);
}

/**
 * Hook for real-time notification updates
 * @param {object} options - Options
 * @param {function} options.onNew - Callback for new notification
 * @param {function} options.onRead - Callback for read notification
 * @param {function} options.onDeleted - Callback for deleted notification
 * @param {function} options.onCountUpdate - Callback for count update
 */
export function useNotificationWebSocket({ onNew, onRead, onDeleted, onCountUpdate } = {}) {
  useWebSocketEvent(WS_EVENTS.NOTIFICATION_NEW, onNew);
  useWebSocketEvent(WS_EVENTS.NOTIFICATION_READ, onRead);
  useWebSocketEvent(WS_EVENTS.NOTIFICATION_DELETED, onDeleted);
  useWebSocketEvent(WS_EVENTS.NOTIFICATION_COUNT, onCountUpdate);
}

/**
 * Hook for real-time alert updates
 * @param {object} options - Options
 * @param {function} options.onNew - Callback for new alert
 * @param {function} options.onAcknowledged - Callback for acknowledged alert
 * @param {function} options.onDeleted - Callback for deleted alert
 * @param {function} options.onCountUpdate - Callback for count update
 */
export function useAlertWebSocket({ onNew, onAcknowledged, onDeleted, onCountUpdate } = {}) {
  useWebSocketEvent(WS_EVENTS.ALERT_NEW, onNew);
  useWebSocketEvent(WS_EVENTS.ALERT_ACKNOWLEDGED, onAcknowledged);
  useWebSocketEvent(WS_EVENTS.ALERT_DELETED, onDeleted);
  useWebSocketEvent(WS_EVENTS.ALERT_COUNT, onCountUpdate);
}

/**
 * Hook for real-time data stream updates (tasks, ponds, expenses)
 * @param {object} options - Options
 * @param {function} options.onTaskUpdate - Callback for task update
 * @param {function} options.onPondUpdate - Callback for pond update
 * @param {function} options.onExpenseUpdate - Callback for expense update
 */
export function useDataStreamWebSocket({ onTaskUpdate, onPondUpdate, onExpenseUpdate } = {}) {
  useWebSocketEvent(WS_EVENTS.STREAM_TASK_UPDATE, onTaskUpdate);
  useWebSocketEvent(WS_EVENTS.STREAM_POND_UPDATE, onPondUpdate);
  useWebSocketEvent(WS_EVENTS.STREAM_EXPENSE_UPDATE, onExpenseUpdate);
}

export default {
  useWebSocketConnection,
  useWebSocketEvent,
  useNotificationWebSocket,
  useAlertWebSocket,
  useDataStreamWebSocket,
};

