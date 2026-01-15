/**
 * Speech Synthesis Hook
 * Custom hook for text-to-speech functionality.
 *
 * @module components/assistant/hooks/useSpeechSynthesis
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { SPEECH_RATE, SPEECH_PITCH } from '../constants';

/**
 * useSpeechSynthesis - Hook for browser TTS
 *
 * @param {Object} options
 * @param {boolean} options.enabled - Whether TTS is enabled
 * @returns {Object} { speak, stop, isSpeaking, isSupported }
 */
export default function useSpeechSynthesis({ enabled = false } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef(null);

  // Check support on mount
  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  // Stop speaking
  const stop = useCallback(() => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } catch (e) {
      console.warn('Failed to stop speech', e);
    }
  }, []);

  // Speak text
  const speak = useCallback(
    (text) => {
      if (!enabled || !isSupported || !text) return;

      try {
        stop(); // Cancel any ongoing speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = SPEECH_RATE;
        utterance.pitch = SPEECH_PITCH;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis failed', e);
        setIsSpeaking(false);
      }
    },
    [enabled, isSupported, stop]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
}

