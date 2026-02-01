/**
 * Notification Sound Settings Component
 * Configure sound notifications for alerts and messages
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  Slider,
  FormControlLabel,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import {
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  PlayArrow as TestIcon,
} from '@mui/icons-material';
import { notificationSound, testSound } from '../../../utils/settings/notifications/sounds';

export default function NotificationSoundSettings() {
  const [enabled, setEnabled] = useState(notificationSound.isEnabled());
  const [volume, setVolume] = useState(notificationSound.getVolume());

  useEffect(() => {
    setEnabled(notificationSound.isEnabled());
    setVolume(notificationSound.getVolume());
  }, []);

  const handleToggle = (event) => {
    const newEnabled = event.target.checked;
    setEnabled(newEnabled);
    notificationSound.setEnabled(newEnabled);
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    notificationSound.setVolume(newValue);
  };

  const handleTest = () => {
    testSound();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Sound Notifications
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure sound alerts for notifications and system alerts
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3}>
        {/* Enable/Disable */}
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={handleToggle}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Enable Sound Notifications
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Play sounds when receiving alerts and notifications
                </Typography>
              </Box>
            }
          />
        </Box>

        {/* Volume Control */}
        <Box sx={{ opacity: enabled ? 1 : 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <VolumeOffIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Volume: {Math.round(volume * 100)}%
            </Typography>
            <VolumeIcon color="action" />
          </Box>
          <Slider
            value={volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.1}
            disabled={!enabled}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            sx={{ ml: 1, mr: 1 }}
          />
        </Box>

        {/* Test Button */}
        <Box>
          <Button
            variant="outlined"
            startIcon={<TestIcon />}
            onClick={handleTest}
            disabled={!enabled}
            fullWidth
          >
            Test Sound
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
