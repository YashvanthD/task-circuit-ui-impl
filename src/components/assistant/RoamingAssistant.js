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
  BOTTOM_RIGHT_POSITION,
} from './constants';

// Config
import { BASE_APP_PATH_USER_AI } from '../../config';
import { aiStore, AI_EVENTS } from '../../utils/ai/store';

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
  const [pinned, setPinned] = useState(true); // Default to pinned (sticky button)
  const [pinnedBottomRight, setPinnedBottomRight] = useState(true); // Default to bottom-right position
  const [humanLike, setHumanLike] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  // Optional conversation display
  const [showConversation] = useState(false);

  // Popup state
  const [popup, setPopup] = useState({ visible: false, text: '' });
  const popupTimerRef = useRef(null);

  // Messages state (synced with aiStore)
  const [messages, setMessages] = useState(aiStore.getMessages());

  // Subscribe to AI Store
  useEffect(() => {
    const updateHandler = (msgs) => {
        // Convert to format expected by AssistantConversation { role, text, timestamp }
        const formatted = msgs.map(m => ({
            role: m.sender_key === 'ai-assistant' ? 'assistant' : 'user',
            text: m.content,
            timestamp: new Date(m.created_at).getTime()
        }));
        setMessages(formatted);
    };

    aiStore.on(AI_EVENTS.UPDATED, updateHandler);
    // Initial load
    updateHandler(aiStore.getMessages());

    return () => {
        aiStore.off(AI_EVENTS.UPDATED, updateHandler);
    };
  }, []);

  // Hand state
  const [handStyle, setHandStyle] = useState(null);
  const handVisibleUntilRef = useRef(0);

  // Interaction timer
  const interactTimerRef = useRef(null);

  // Bottom-right position for when pinned
  const bottomRightPosition = { right: BOTTOM_RIGHT_POSITION.right, bottom: BOTTOM_RIGHT_POSITION.bottom };

  // Hooks
  const {
    position,
    isDragging,
    handleDragStart,
    moveToElement,
    randomRoam,
  } = useAssistantPosition();

  const { speak, isSpeaking } = useSpeechSynthesis({
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
      // Add to shared store
      aiStore.addUserMessage(text);

      if (speechEnabled) {
        speak('Heard: ' + text);
        // Simulate response for now
        setTimeout(() => {
             const reply = "I heard you. I'm just a roaming UI for now, visit the AI page for more.";
             aiStore.addAssistantMessage(reply);
             if (speechEnabled) speak(reply);
        }, 1000);
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
    setPinned((p) => {
      const newPinned = !p;
      if (newPinned) {
        // When pinning, also set to bottom-right position
        setPinnedBottomRight(true);
        showPopup('Pinned to bottom-right');
      } else {
        // When unpinning, keep at current position but allow roaming
        setPinnedBottomRight(false);
        showPopup('Unpinned - roaming enabled');
      }
      return newPinned;
    });
  }, [showPopup]);

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
    navigate(BASE_APP_PATH_USER_AI);
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
        position={pinnedBottomRight ? bottomRightPosition : position}
        isDragging={isDragging}
        paused={paused}
        hasAlert={hasTargets && currentTarget?.priority <= 2}
        isListening={isListening}
        isSpeaking={isSpeaking}
        pinnedBottomRight={pinnedBottomRight}
        onMouseDown={pinnedBottomRight ? undefined : handleDragStart}
        onMouseEnter={handleFabMouseEnter}
        onMouseLeave={handleFabMouseLeave}
      />

      {/* Control Panel */}
      <AssistantControlPanel
        visible={isInteracting}
        position={pinnedBottomRight ? bottomRightPosition : position}
        paused={paused}
        speechEnabled={speechEnabled}
        isListening={isListening}
        pinned={pinned}
        humanLike={humanLike}
        targetCount={totalTargets}
        pinnedBottomRight={pinnedBottomRight}
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
        position={pinnedBottomRight ? bottomRightPosition : position}
        placement={pinnedBottomRight ? 'top' : 'top'}
        pinnedBottomRight={pinnedBottomRight}
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

