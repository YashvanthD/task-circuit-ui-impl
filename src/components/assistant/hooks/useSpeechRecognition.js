/**
 * Speech Recognition Hook
 * Custom hook for voice input functionality.
 *
 * @module components/assistant/hooks/useSpeechRecognition
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { SPEECH_LANG } from '../constants';

/**
 * useSpeechRecognition - Hook for browser speech recognition
 *
 * @param {Object} options
 * @param {Function} options.onResult - Callback when speech is recognized
 * @param {Function} options.onInterim - Callback for interim results
 * @param {Function} options.onError - Callback for errors
 * @returns {Object} { start, stop, isListening, isSupported }
 */
export default function useSpeechRecognition({
  onResult,
  onInterim,
  onError,
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANG;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (interimTranscript && onInterim) {
        onInterim(interimTranscript);
      }

      if (finalTranscript && onResult) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (onError) {
        onError(event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
      recognitionRef.current = null;
    };
  }, [onResult, onInterim, onError]);

  // Start listening
  const start = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      console.warn('Speech recognition not supported');
      return false;
    }

    try {
      setIsListening(true);
      recognitionRef.current.start();
      return true;
    } catch (e) {
      console.warn('Failed to start speech recognition', e);
      setIsListening(false);
      return false;
    }
  }, [isSupported]);

  // Stop listening
  const stop = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (e) {
      console.warn('Failed to stop speech recognition', e);
    }
  }, []);

  return {
    start,
    stop,
    isListening,
    isSupported,
  };
}

