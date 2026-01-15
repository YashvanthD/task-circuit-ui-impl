/**
 * RoamingAssistant Component (Modular Version)
 * A floating AI assistant that roams the UI and highlights important elements.
 *
 * @module components/assistant/RoamingAssistant
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Sub-components
import AssistantFab from './AssistantFab';
import AssistantControlPanel from './AssistantControlPanel';
import AssistantPopup from './AssistantPopup';
import AssistantHand, { computeHandStyle } from './AssistantHand';
import AssistantConversation from './AssistantConversation';

// Hooks
import {
  useSpeechSynthesis,
  useSpeechRecognition,
  useAssistantPosition,
  useTargetScanning,
} from './hooks';

// Constants
import {
  POPUP_DURATION,
  HAND_KEYFRAMES_ID,
  SCAN_INTERVAL,
  INTERACTION_HIDE_DELAY,
  MESSAGE_PROTECTION_MS,
} from './constants';

// Config
import { BASE_APP_PATH_USER_CHAT } from '../../config';

/**
 * RoamingAssistant - Main assistant component
 *
 * This component orchestrates all the sub-components and hooks
 * to provide a floating AI assistant experience.
 */
export default function RoamingAssistant() {
  const navigate = useNavigate();

  // Prevent multiple instances
  const [isPrimaryInstance, setIsPrimaryInstance] = useState(false);

  useEffect(() => {
    window.__ra_instances = (window.__ra_instances || 0) + 1;
    const amPrimary = !window.__ra_primary_instance;
    if (amPrimary) {
      window.__ra_primary_instance = true;
    }
    setIsPrimaryInstance(amPrimary);

    return () => {
      window.__ra_instances = Math.max(0, (window.__ra_instances || 1) - 1);
      if (amPrimary) {
        delete window.__ra_primary_instance;
      }
    };
  }, []);

  // Core state
  const [enabled, setEnabled] = useState(true);
  const [paused, setPaused] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [humanLike, setHumanLike] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  // Popup state
  const [popup, setPopup] = useState({ visible: false, text: '' });
  const popupTimerRef = useRef(null);

  // Messages state
  const [messages, setMessages] = useState([]);

  // Hand state
  const [handStyle, setHandStyle] = useState(null);
  const handVisibleUntilRef = useRef(0);

  // Interaction timer
  const interactTimerRef = useRef(null);

  // Hooks
  const {
    position,
    isDragging,
    handleDragStart,
    moveTo,
    moveToElement,
    randomRoam,
  } = useAssistantPosition();

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis({
    enabled: speechEnabled,
  });

  const {
    start: startListening,
    stop: stopListening,
    isListening,
    isSupported: micSupported,
  } = useSpeechRecognition({
    onResult: (text) => {
      showPopup(text);
      addMessage('user', text);
      if (speechEnabled) {
        speak('Heard: ' + text);
      }
    },
    onInterim: (text) => {
      showPopup(text + ' ...');
    },
    onError: (error) => {
      showPopup('Mic error: ' + error);
    },
  });

  const {
    targets,
    currentTarget,
    currentIndex,
    totalTargets,
    nextTarget,
    prevTarget,
    hasTargets,
  } = useTargetScanning({
    enabled: enabled && isPrimaryInstance,
    paused: paused || pinned,
  });

  // Inject hand animation keyframes
  useEffect(() => {
    if (!isPrimaryInstance) return;
    if (document.getElementById(HAND_KEYFRAMES_ID)) return;

    const style = document.createElement('style');
    style.id = HAND_KEYFRAMES_ID;
    style.textContent = `
      @keyframes ra-hand-point {
        0% { transform: translateX(0); }
        50% { transform: translateX(var(--ra-hand-move, 8px)); }
        100% { transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      try { style.remove(); } catch (e) {}
    };
  }, [isPrimaryInstance]);

  // Show popup helper
  const showPopup = useCallback((text) => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }
    setPopup({ visible: true, text });
    popupTimerRef.current = setTimeout(() => {
      setPopup({ visible: false, text: '' });
    }, POPUP_DURATION);
  }, []);

  // Add message to conversation
  const addMessage = useCallback((role, text) => {
    setMessages((prev) => [
      ...prev,
      { role, text, timestamp: Date.now() },
    ]);
  }, []);

  // Remove message from conversation
  const removeMessage = useCallback((index) => {
    setMessages((prev) => {
      const msg = prev[index];
      if (msg && Date.now() - (msg.timestamp || 0) < MESSAGE_PROTECTION_MS) {
        showPopup('Message is protected for 30s');
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  }, [showPopup]);

  // Clear old messages
  const clearMessages = useCallback(() => {
    const now = Date.now();
    setMessages((prev) =>
      prev.filter((m) => now - (m.timestamp || 0) < MESSAGE_PROTECTION_MS)
    );
    showPopup('Cleared older messages');
  }, [showPopup]);

  // Schedule interaction hide
  const scheduleHide = useCallback((delay = INTERACTION_HIDE_DELAY) => {
    if (interactTimerRef.current) {
      clearTimeout(interactTimerRef.current);
    }
    interactTimerRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, delay);
  }, []);

  // Handle roaming to targets
  useEffect(() => {
    if (!isPrimaryInstance || !enabled || paused || pinned || isInteracting) return;

    if (currentTarget?.element) {
      moveToElement(currentTarget.element);
      handVisibleUntilRef.current = Date.now() + 5000;

      // Show info popup
      const info = currentTarget.info || 'Check this item';
      showPopup(info);
      if (speechEnabled) {
        speak(info);
      }
    }
  }, [currentTarget, isPrimaryInstance, enabled, paused, pinned, isInteracting, moveToElement, showPopup, speechEnabled, speak]);

  // Update hand style
  useEffect(() => {
    if (!isPrimaryInstance || isInteracting) {
      setHandStyle(null);
      return;
    }

    if (currentTarget?.element && Date.now() < handVisibleUntilRef.current) {
      const style = computeHandStyle(position, currentTarget.element);
      setHandStyle(style);
    } else {
      setHandStyle(null);
    }
  }, [currentTarget, position, isInteracting, isPrimaryInstance]);

  // Auto-roam when no targets
  useEffect(() => {
    if (!isPrimaryInstance || !enabled || paused || pinned || hasTargets) return;

    const interval = setInterval(() => {
      if (!isInteracting && humanLike) {
        randomRoam();
      }
    }, SCAN_INTERVAL * 2);

    return () => clearInterval(interval);
  }, [isPrimaryInstance, enabled, paused, pinned, hasTargets, isInteracting, humanLike, randomRoam]);

  // Handlers
  const handleFabMouseEnter = useCallback(() => {
    setIsInteracting(true);
    if (interactTimerRef.current) {
      clearTimeout(interactTimerRef.current);
    }
  }, []);

  const handleFabMouseLeave = useCallback(() => {
    scheduleHide(3000);
  }, [scheduleHide]);

  const handlePanelMouseEnter = useCallback(() => {
    if (interactTimerRef.current) {
      clearTimeout(interactTimerRef.current);
    }
  }, []);

  const handlePanelMouseLeave = useCallback(() => {
    scheduleHide(2000);
  }, [scheduleHide]);

  const handlePauseToggle = useCallback(() => {
    setPaused((p) => !p);
    showPopup(paused ? 'Resuming...' : 'Paused');
  }, [paused, showPopup]);

  const handleSpeechToggle = useCallback(() => {
    setSpeechEnabled((s) => !s);
    showPopup(speechEnabled ? 'Speech disabled' : 'Speech enabled');
  }, [speechEnabled, showPopup]);

  const handleMicToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      if (micSupported) {
        startListening();
        showPopup('Listening...');
      } else {
        showPopup('Mic not supported');
      }
    }
  }, [isListening, micSupported, startListening, stopListening, showPopup]);

  const handlePinToggle = useCallback(() => {
    setPinned((p) => !p);
    showPopup(pinned ? 'Unpinned' : 'Pinned');
  }, [pinned, showPopup]);

  const handleHumanToggle = useCallback(() => {
    setHumanLike((h) => !h);
    showPopup(humanLike ? 'Robot mode' : 'Human mode');
  }, [humanLike, showPopup]);

  const handlePrev = useCallback(() => {
    const target = prevTarget();
    if (target) {
      showPopup(`Target ${currentIndex}/${totalTargets}`);
    }
  }, [prevTarget, currentIndex, totalTargets, showPopup]);

  const handleNext = useCallback(() => {
    const target = nextTarget();
    if (target) {
      showPopup(`Target ${currentIndex + 2}/${totalTargets}`);
    }
  }, [nextTarget, currentIndex, totalTargets, showPopup]);

  const handleOpenChat = useCallback(() => {
    navigate(BASE_APP_PATH_USER_CHAT);
  }, [navigate]);

  const handleClose = useCallback(() => {
    setEnabled(false);
    showPopup('Assistant disabled');
  }, [showPopup]);

  const handlePopupClose = useCallback(() => {
    setPopup({ visible: false, text: '' });
  }, []);

  // Don't render if not primary or disabled
  if (!isPrimaryInstance || !enabled) {
    return null;
  }

  return (
    <Box>
      {/* Main Fab */}
      <AssistantFab
        position={position}
        isDragging={isDragging}
        paused={paused}
        hasAlert={hasTargets && currentTarget?.priority <= 2}
        isListening={isListening}
        isSpeaking={isSpeaking}
        onMouseDown={handleDragStart}
        onMouseEnter={handleFabMouseEnter}
        onMouseLeave={handleFabMouseLeave}
      />

      {/* Control Panel */}
      <AssistantControlPanel
        visible={isInteracting}
        position={position}
        paused={paused}
        speechEnabled={speechEnabled}
        isListening={isListening}
        pinned={pinned}
        humanLike={humanLike}
        targetCount={totalTargets}
        onPauseToggle={handlePauseToggle}
        onSpeechToggle={handleSpeechToggle}
        onMicToggle={handleMicToggle}
        onPinToggle={handlePinToggle}
        onHumanToggle={handleHumanToggle}
        onPrev={handlePrev}
        onNext={handleNext}
        onOpenChat={handleOpenChat}
        onClear={clearMessages}
        onClose={handleClose}
        onMouseEnter={handlePanelMouseEnter}
        onMouseLeave={handlePanelMouseLeave}
      />

      {/* Popup */}
      <AssistantPopup
        visible={popup.visible}
        text={popup.text}
        position={position}
        onClose={handlePopupClose}
      />

      {/* Pointing Hand */}
      <AssistantHand
        style={handStyle}
        visible={!!handStyle && !isInteracting}
      />

      {/* Conversation */}
      <AssistantConversation
        visible={showConversation && messages.length > 0}
        messages={messages}
        position={position}
        onRemoveMessage={removeMessage}
      />
    </Box>
  );
}

