/**
 * Notification Sounds Utility
 * Handles playing alert and notification sounds
 */

const SOUND_PATHS = {
  notification: '/sounds/notification.mp3',
  alert: '/sounds/notification.mp3',
  critical: '/sounds/notification.mp3',
  success: '/sounds/notification.mp3',
};

class NotificationSoundManager {
  constructor() {
    this.enabled = this.loadSetting();
    this.volume = this.loadVolume();
    this.audio = null;
  }

  loadSetting() {
    const saved = localStorage.getItem('notification_sounds_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  }

  loadVolume() {
    const saved = localStorage.getItem('notification_sounds_volume');
    return saved !== null ? parseFloat(saved) : 0.7;
  }

  saveSetting(enabled) {
    this.enabled = enabled;
    localStorage.setItem('notification_sounds_enabled', JSON.stringify(enabled));
  }

  saveVolume(volume) {
    this.volume = volume;
    localStorage.setItem('notification_sounds_volume', volume.toString());
  }

  isEnabled() {
    return this.enabled;
  }

  getVolume() {
    return this.volume;
  }

  setEnabled(enabled) {
    this.saveSetting(enabled);
  }

  setVolume(volume) {
    this.saveVolume(volume);
  }

  play(type = 'notification') {
    if (!this.enabled) return;

    try {
      const soundPath = SOUND_PATHS[type] || SOUND_PATHS.notification;

      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }

      this.audio = new Audio(soundPath);
      this.audio.volume = this.volume;

      this.audio.play().catch(err => {
        console.warn('[NotificationSound] Failed to play:', err);
      });
    } catch (error) {
      console.error('[NotificationSound] Error:', error);
    }
  }

  playNotification() {
    this.play('notification');
  }

  playAlert(severity = 'medium') {
    const type = severity === 'critical' || severity === 'high' ? 'critical' : 'alert';
    this.play(type);
  }

  playSuccess() {
    this.play('success');
  }

  test() {
    this.play('notification');
  }
}

export const notificationSound = new NotificationSoundManager();

export const playNotificationSound = () => {
  notificationSound.playNotification();
};

export const playAlertSound = (alert) => {
  if (!alert) {
    notificationSound.playAlert();
    return;
  }
  const severity = alert.severity || 'medium';
  notificationSound.playAlert(severity);
};

export const playSuccessSound = () => {
  notificationSound.playSuccess();
};

export const testSound = () => {
  notificationSound.test();
};
