/**
 * Notifications - Sound Manager
 * Handles notification sounds based on user notification settings.
 * Supports severity-based sound variations.
 *
 * @module utils/notifications/sound
 */

// Sound file path (hosted URL)
const NOTIFICATION_SOUND_PATH = 'https://github.com/YashvanthD/assets/raw/1cdabc6b7877beda9a0a8d62722f74e2cf2231bf/sounds/notification.mp3';

// Audio instance (lazy loaded)
let audioInstance = null;

// Local sound enabled state (can be overridden locally)
let localSoundEnabled = true;

// Last played timestamp (to prevent rapid repeated sounds)
let lastPlayedTime = 0;
const MIN_SOUND_INTERVAL = 1000; // Minimum 1 second between sounds

// Severity-based configuration
const SEVERITY_CONFIG = {
  critical: { volume: 1.0, repeat: 2, delay: 300 },
  high: { volume: 0.8, repeat: 1, delay: 0 },
  medium: { volume: 0.6, repeat: 1, delay: 0 },
  low: { volume: 0.4, repeat: 1, delay: 0 },
  default: { volume: 0.5, repeat: 1, delay: 0 },
};

/**
 * Get notification settings from tc_user_session
 * @returns {object} Notification settings
 */
function getNotificationSettings() {
  try {
    const sessionStr = localStorage.getItem('tc_user_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session?.settings?.notifications || {};
    }
  } catch (e) {
    // Ignore parse errors
  }
  return {};
}

/**
 * Check if notifications are enabled in user settings
 * @returns {boolean}
 */
function isNotificationsEnabled() {
  const settings = getNotificationSettings();
  // Check if notifications are globally enabled
  // Default to true if not set
  return settings.enabled !== false;
}

/**
 * Check if push/sound notifications are enabled
 * @returns {boolean}
 */
function isPushEnabled() {
  const settings = getNotificationSettings();
  // Check push setting, default to true if not set
  return settings.push !== false;
}

/**
 * Get or create audio instance
 * @returns {HTMLAudioElement|null}
 */
function getAudio() {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') {
    return null;
  }

  if (!audioInstance) {
    try {
      audioInstance = new Audio(NOTIFICATION_SOUND_PATH);
      audioInstance.volume = 0.5;
    } catch (e) {
      console.warn('[NotificationSound] Failed to create audio:', e);
      return null;
    }
  }

  return audioInstance;
}

/**
 * Check if sound should play based on all settings
 * @returns {boolean}
 */
function shouldPlaySound() {
  // Check local override
  if (!localSoundEnabled) return false;

  // Check user notification settings
  if (!isNotificationsEnabled()) return false;
  if (!isPushEnabled()) return false;

  return true;
}

/**
 * Play notification sound
 * Only plays if notifications and push are enabled in user settings
 * @param {string} severity - Alert severity (critical, high, medium, low)
 */
export function playNotificationSound(severity = 'default') {
  if (!shouldPlaySound()) {
    console.log('[NotificationSound] Sound disabled by settings');
    return;
  }

  // Prevent rapid repeated sounds
  const now = Date.now();
  if (now - lastPlayedTime < MIN_SOUND_INTERVAL) {
    console.log('[NotificationSound] Throttled - too soon since last sound');
    return;
  }
  lastPlayedTime = now;

  const audio = getAudio();
  if (!audio) return;

  // Get severity configuration
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.default;

  try {
    // Set volume based on severity
    audio.volume = config.volume;

    // Play the sound
    const playOnce = () => {
      audio.currentTime = 0;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('[NotificationSound] Playback prevented:', error);
        });
      }
    };

    // Play immediately
    playOnce();

    // Repeat for critical alerts
    if (config.repeat > 1 && config.delay > 0) {
      for (let i = 1; i < config.repeat; i++) {
        setTimeout(playOnce, config.delay * i);
      }
    }
  } catch (e) {
    console.warn('[NotificationSound] Failed to play:', e);
  }
}

/**
 * Play alert sound with severity
 * @param {object} alert - Alert object with severity field
 */
export function playAlertSound(alert) {
  const severity = alert?.severity || 'default';
  playNotificationSound(severity);
}

/**
 * Enable notification sounds (local override)
 */
export function enableSound() {
  localSoundEnabled = true;
  try {
    localStorage.setItem('notification_sound_enabled', 'true');
  } catch (e) { /* ignore */ }
}

/**
 * Disable notification sounds (local override)
 */
export function disableSound() {
  localSoundEnabled = false;
  try {
    localStorage.setItem('notification_sound_enabled', 'false');
  } catch (e) { /* ignore */ }
}

/**
 * Toggle notification sound (local override)
 * @returns {boolean} New state
 */
export function toggleSound() {
  if (localSoundEnabled) {
    disableSound();
  } else {
    enableSound();
  }
  return localSoundEnabled;
}

/**
 * Check if sound is enabled (combines local and user settings)
 * @returns {boolean}
 */
export function isSoundEnabled() {
  return shouldPlaySound();
}

/**
 * Check if sound is locally enabled (ignores user settings)
 * @returns {boolean}
 */
export function isLocalSoundEnabled() {
  return localSoundEnabled;
}

/**
 * Set volume
 * @param {number} volume - 0 to 1
 */
export function setVolume(volume) {
  const audio = getAudio();
  if (audio) {
    audio.volume = Math.max(0, Math.min(1, volume));
  }
}

// Initialize from localStorage
try {
  const stored = localStorage.getItem('notification_sound_enabled');
  if (stored === 'false') {
    localSoundEnabled = false;
  }
} catch (e) { /* ignore */ }

export default {
  playNotificationSound,
  playAlertSound,
  enableSound,
  disableSound,
  toggleSound,
  isSoundEnabled,
  isLocalSoundEnabled,
  setVolume,
  // Expose settings checkers
  isNotificationsEnabled,
  isPushEnabled,
};

