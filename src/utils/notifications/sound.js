/**
 * Notifications - Sound Manager
 * Handles notification sounds based on user notification settings.
 * Supports severity-based sound variations.
 *
 * @module utils/notifications/sound
 */

// Sound file path (public folder - use relative path to avoid proxy)
const NOTIFICATION_SOUND_PATH = `${process.env.PUBLIC_URL || ''}/sounds/notification.mp3`;

// Audio instance (preloaded and cached in memory)
let audioInstance = null;
let audioBuffer = null;
let audioContext = null;
let isPreloaded = false;

// Local sound enabled state (can be overridden locally)
let localSoundEnabled = true;

// Last played timestamp (to prevent rapid repeated sounds)
let lastPlayedTime = 0;
const MIN_SOUND_INTERVAL = 500; // Minimum 500ms between sounds (reduced for faster alerts)

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
      audioInstance.preload = 'auto'; // Preload the audio file
      audioInstance.load(); // Force load into memory
    } catch (e) {
      console.warn('[NotificationSound] Failed to create audio:', e);
      return null;
    }
  }

  return audioInstance;
}

/**
 * Preload audio file into memory for instant playback
 * This ensures zero delay when playing sound
 */
async function preloadAudio() {
  if (isPreloaded) return;

  try {
    // Method 1: Use HTML Audio with preload
    const audio = getAudio();
    if (audio) {
      // Force the browser to load the audio into memory
      await audio.load();
      isPreloaded = true;
      console.log('[NotificationSound] Audio preloaded successfully');
    }

    // Method 2: Also try Web Audio API for better performance
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(NOTIFICATION_SOUND_PATH);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        console.log('[NotificationSound] AudioBuffer cached in memory');
      } catch (e) {
        console.warn('[NotificationSound] Web Audio API preload failed:', e);
      }
    }
  } catch (e) {
    console.warn('[NotificationSound] Preload failed:', e);
  }
}

/**
 * Play sound using Web Audio API (instant, no delay)
 * @param {number} volume - Volume level (0-1)
 */
function playWithWebAudio(volume = 0.5) {
  if (!audioBuffer || !audioContext) return false;

  try {
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = audioBuffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start(0);
    return true;
  } catch (e) {
    console.warn('[NotificationSound] Web Audio playback failed:', e);
    return false;
  }
}

/**
 * Check if sound should play based on all settings
 * @returns {boolean}
 */
function shouldPlaySound() {
  // Always allow sound by default - user can disable if needed
  return true;
}

/**
 * Play notification sound
 * Uses Web Audio API for instant playback (zero delay)
 * Falls back to HTML Audio if Web Audio API fails
 * @param {string} severity - Alert severity (critical, high, medium, low)
 */
export function playNotificationSound(severity = 'default') {
    console.log("playNotificationSound called with severity:", severity);
  if (!shouldPlaySound()) {
    return;
  }

  // Prevent rapid repeated sounds
  const now = Date.now();
  if (now - lastPlayedTime < MIN_SOUND_INTERVAL) {
    return;
  }
  lastPlayedTime = now;

  // Get severity configuration
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.default;

  try {
    // Try Web Audio API first (instant playback from memory)
    const webAudioSuccess = playWithWebAudio(config.volume);

    if (webAudioSuccess) {
      console.log('[NotificationSound] Played with Web Audio API');

      // Repeat for critical alerts
      if (config.repeat > 1 && config.delay > 0) {
        for (let i = 1; i < config.repeat; i++) {
          setTimeout(() => playWithWebAudio(config.volume), config.delay * i);
        }
      }
      return;
    }

    // Fallback to HTML Audio
    const audio = getAudio();
    if (!audio) {
      console.warn('[NotificationSound] No audio instance available');
      return;
    }

    // Set volume based on severity
    audio.volume = config.volume;

    // Play the sound
    const playOnce = () => {
      audio.currentTime = 0;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[NotificationSound] Played with HTML Audio');
          })
          .catch((error) => {
            console.warn('[NotificationSound] Playback prevented:', error.message);
            // Browser may require user interaction first
            if (error.name === 'NotAllowedError') {
              console.warn('[NotificationSound] Click anywhere on the page to enable sound');
            }
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

// Preload audio file into memory immediately when module loads
if (typeof window !== 'undefined') {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    preloadAudio().catch(err => {
      console.warn('[NotificationSound] Auto-preload failed:', err);
    });
  }, 1000);
}

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

