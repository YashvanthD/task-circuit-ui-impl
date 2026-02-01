# Notification Sounds

This folder contains sound files used for system notifications and alerts.

## Sound Files

- **notification.mp3** - Default notification sound for alerts and messages

## Usage

Sounds are played through the `notificationSounds.js` utility module.

## Adding New Sounds

1. Add your `.mp3` file to this directory
2. Update `SOUND_PATHS` in `src/utils/notificationSounds.js`
3. Use the appropriate play function

## Settings

Users can configure sound notifications through the NotificationSoundSettings component:
- Enable/disable sounds
- Adjust volume (0-100%)
- Test sound playback
