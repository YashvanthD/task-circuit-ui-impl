/**
 * AssistantControlPanel Component
 * Control panel with action buttons for the assistant.
 *
 * @module components/assistant/AssistantControlPanel
 */

import React from 'react';
import { Paper, Stack, IconButton, Tooltip, Divider } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import PushPinIcon from '@mui/icons-material/PushPin';
import PersonIcon from '@mui/icons-material/Person';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import { Z_INDEX } from './constants';

// Tooltip props to ensure tooltips appear above the control panel
const tooltipSlotProps = {
  popper: {
    sx: {
      zIndex: Z_INDEX.controlPanel + 100, // Ensure tooltip is well above control panel
    },
    modifiers: [
      {
        name: 'preventOverflow',
        options: {
          boundary: 'viewport',
        },
      },
    ],
  },
  tooltip: {
    sx: {
      zIndex: Z_INDEX.controlPanel + 100,
    },
  },
};

/**
 * AssistantControlPanel - Control buttons for the assistant
 *
 * @param {Object} props
 * @param {boolean} props.visible - Whether panel is visible
 * @param {Object} props.position - { left, top } position
 * @param {boolean} props.paused - Whether assistant is paused
 * @param {boolean} props.speechEnabled - Whether TTS is enabled
 * @param {boolean} props.isListening - Whether mic is active
 * @param {boolean} props.pinned - Whether assistant is pinned
 * @param {boolean} props.humanLike - Whether human-like mode is on
 * @param {number} props.targetCount - Number of available targets
 * @param {Function} props.onPauseToggle - Pause toggle handler
 * @param {Function} props.onSpeechToggle - Speech toggle handler
 * @param {Function} props.onMicToggle - Mic toggle handler
 * @param {Function} props.onPinToggle - Pin toggle handler
 * @param {Function} props.onHumanToggle - Human mode toggle handler
 * @param {Function} props.onPrev - Previous target handler
 * @param {Function} props.onNext - Next target handler
 * @param {Function} props.onOpenChat - Open full chat handler
 * @param {Function} props.onClear - Clear messages handler
 * @param {Function} props.onClose - Disable assistant handler
 * @param {Function} props.onMouseEnter - Mouse enter handler
 * @param {Function} props.onMouseLeave - Mouse leave handler
 */
export default function AssistantControlPanel({
  visible,
  position,
  paused,
  speechEnabled,
  isListening,
  pinned,
  humanLike,
  targetCount = 0,
  onPauseToggle,
  onSpeechToggle,
  onMicToggle,
  onPinToggle,
  onHumanToggle,
  onPrev,
  onNext,
  onOpenChat,
  onClear,
  onClose,
  onMouseEnter,
  onMouseLeave,
  pinnedBottomRight = false,
}) {
  if (!visible) return null;

  // Calculate position based on whether it's bottom-right pinned
  // When bottom-right, control panel appears to the LEFT of the FAB
  const positionStyles = pinnedBottomRight
    ? {
        right: (position.right || 20) + 60,
        bottom: (position.bottom || 20) - 10,
        left: 'auto',
        top: 'auto',
      }
    : {
        left: position.left + 60,
        top: position.top - 10,
      };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        ...positionStyles,
        zIndex: Z_INDEX.controlPanel + 50,
        p: 1,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        minWidth: 44,
        transition: 'opacity 0.2s, transform 0.2s',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : (pinnedBottomRight ? 'translateX(10px)' : 'translateX(-10px)'),
        pointerEvents: visible ? 'auto' : 'none',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Playback controls */}
      <Stack direction="row" spacing={0.5}>
        <Tooltip title={paused ? 'Resume' : 'Pause'} placement="top" slotProps={tooltipSlotProps}>
          <IconButton size="small" onClick={onPauseToggle} color={paused ? 'default' : 'primary'}>
            {paused ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title={speechEnabled ? 'Mute' : 'Enable Speech'} placement="top" slotProps={tooltipSlotProps}>
          <IconButton size="small" onClick={onSpeechToggle} color={speechEnabled ? 'primary' : 'default'}>
            {speechEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title={isListening ? 'Stop Listening' : 'Start Listening'} placement="top" slotProps={tooltipSlotProps}>
          <IconButton size="small" onClick={onMicToggle} color={isListening ? 'error' : 'default'}>
            {isListening ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider />

      {/* Mode controls */}
      <Stack direction="row" spacing={0.5}>
        <Tooltip title={pinned ? 'Unpin' : 'Pin Position'} placement="top" slotProps={tooltipSlotProps}>
          <IconButton size="small" onClick={onPinToggle} color={pinned ? 'primary' : 'default'}>
            <PushPinIcon fontSize="small" sx={{ transform: pinned ? 'rotate(45deg)' : 'none' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={humanLike ? 'Disable Human Mode' : 'Enable Human Mode'} placement="top" slotProps={tooltipSlotProps}>
          <IconButton size="small" onClick={onHumanToggle} color={humanLike ? 'primary' : 'default'}>
            {humanLike ? <PersonIcon fontSize="small" /> : <PersonOffIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider />

      {/* Navigation controls */}
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Previous Target" placement="top" slotProps={tooltipSlotProps}>
          <span>
            <IconButton size="small" onClick={onPrev} disabled={targetCount === 0}>
              <NavigateBeforeIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Next Target" placement="top" slotProps={tooltipSlotProps}>
          <span>
            <IconButton size="small" onClick={onNext} disabled={targetCount === 0}>
              <NavigateNextIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Divider />

      {/* Actions */}
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Open Full Chat" placement="top" slotProps={tooltipSlotProps}>
          <IconButton size="small" onClick={onOpenChat}>
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear Messages" placement="top" slotProps={tooltipSlotProps}>
          <IconButton size="small" onClick={onClear}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Disable Assistant" placement="top" slotProps={tooltipSlotProps}>
          <IconButton size="small" onClick={onClose} color="error">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

