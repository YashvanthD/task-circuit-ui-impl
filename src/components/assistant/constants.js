/**
 * Assistant Constants
 * Centralized constants for the RoamingAssistant component.
 *
 * @module components/assistant/constants
 */

// Timing constants
export const TRANSITION_MS = 700;
export const SCAN_INTERVAL = 3000; // rescan DOM every 3s
export const POPUP_DURATION = 6000; // popup visible for 6s
export const INTERACTION_HIDE_DELAY = 10000; // 10s delay before hiding controls
export const MESSAGE_PROTECTION_MS = 30000; // 30s protection for messages

// Hand animation
export const HAND_ROTATE_OFFSET = 90; // degrees rotation offset

// Fab sizes
export const FAB_SIZE = 56;
export const FAB_SIZE_SMALL = 40;

// Colors
export const ASSISTANT_COLORS = {
  primary: '#1976d2',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  highlight: 'rgba(255, 215, 0, 0.5)',
  highlightBorder: '#ffd700',
};

// Z-indices (high values to ensure visibility)
export const Z_INDEX = {
  fab: 2000,
  controlPanel: 2100,
  popup: 2200,
  hand: 1999,
};

// Initial position
export const INITIAL_POSITION = { left: 20, top: 120 };

// Bottom-right pinned position (with some padding from edges)
export const BOTTOM_RIGHT_POSITION = { right: 20, bottom: 20 };

// Animation keyframes ID
export const HAND_KEYFRAMES_ID = 'ra-hand-keyframes';

// Speech settings
export const SPEECH_RATE = 0.7;
export const SPEECH_PITCH = 1;
export const SPEECH_LANG = 'en-US';

// Popup positions
export const POPUP_POSITIONS = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
};

// Assistant modes
export const ASSISTANT_MODES = {
  ROAMING: 'roaming',
  PINNED: 'pinned',
  HIDDEN: 'hidden',
};

// Control button configs
export const CONTROL_BUTTONS = [
  { id: 'pause', icon: 'pause', activeIcon: 'play', tooltip: 'Pause/Resume' },
  { id: 'speaker', icon: 'volumeUp', activeIcon: 'volumeOff', tooltip: 'Toggle Speaker' },
  { id: 'mic', icon: 'mic', tooltip: 'Voice Input' },
  { id: 'pin', icon: 'pin', tooltip: 'Pin Assistant' },
  { id: 'humanLike', icon: 'person', activeIcon: 'personOff', tooltip: 'Toggle Human Mode' },
  { id: 'prev', icon: 'prev', tooltip: 'Previous Target' },
  { id: 'next', icon: 'next', tooltip: 'Next Target' },
  { id: 'openChat', icon: 'openInNew', tooltip: 'Open Full Chat' },
  { id: 'clear', icon: 'clear', tooltip: 'Clear Messages' },
  { id: 'close', icon: 'close', tooltip: 'Disable Assistant' },
];

