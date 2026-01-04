import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Fab, Paper, Typography, IconButton, Tooltip, Badge, Button } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonIcon from '@mui/icons-material/Person';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import PushPinIcon from '@mui/icons-material/PushPin';
import ClearIcon from '@mui/icons-material/Clear';

import { annotateImportantItems } from '../utils/ai';
import { personalize, computeHandStyle, computeFabPositionForElement, formatInfoFromElement, collectTargets } from '../utils/assistant';

// RoamingAssistant: a small floating assistant icon that "roams" the UI
// It looks for DOM elements annotated with data-critical or data-next-action
// and moves the icon to them. It highlights the target and shows a tiny popup
// describing the next action. It also roams randomly when no targets are found.
// Enhancements: tooltips, alert badge, popup messages, and text-to-speech using the
// browser SpeechSynthesis API (uses the browser's default TTS voice, often Google on Chrome).

const TRANSITION_MS = 700;
const SCAN_INTERVAL = 3000; // rescan DOM every 3s
const POPUP_DURATION = 6000; // popup visible for 6s
// Hand rotation offset (degrees) - tweak if the finger points wrong. Default +90 aligns TouchApp icon upwards->right.
const HAND_ROTATE_OFFSET = 90;

export default function RoamingAssistant() {
  // Prevent multiple active instances (HMR or accidental double mounts can cause two icons/hands)
  const [isPrimaryInstance, setIsPrimaryInstance] = useState(false);
  useEffect(() => {
    // global counter on window to track instances
    // eslint-disable-next-line no-underscore-dangle
    window.__ra_instances = (window.__ra_instances || 0) + 1;
    // eslint-disable-next-line no-underscore-dangle
    const amPrimary = !window.__ra_primary_instance;
    if (amPrimary) {
      // eslint-disable-next-line no-underscore-dangle
      window.__ra_primary_instance = true;
    }
    setIsPrimaryInstance(amPrimary);
    if (!amPrimary) console.warn('RoamingAssistant: another instance is already active; this instance will stay idle to avoid duplicates.');
    return () => {
      // eslint-disable-next-line no-underscore-dangle
      window.__ra_instances = Math.max(0, (window.__ra_instances || 1) - 1);
      // If this was primary, clear the primary flag so a new mount can become primary
      if (amPrimary) {
        // eslint-disable-next-line no-underscore-dangle
        delete window.__ra_primary_instance;
      }
    };
  }, []);

  // Do NOT return early here — hooks must run in the same order.
  // We'll guard heavy effects and rendering instead so hooks are stable.

  const [enabled, setEnabled] = useState(true);
  const [paused, setPaused] = useState(false);
  const [position, setPosition] = useState({ left: 20, top: 120 });
  // keep a ref of position so effects can read latest position without needing it in deps
  const positionRef = useRef(position);
  // setter that updates both state and ref (accepts value or updater function)
  const setPositionSafe = useCallback((updater) => {
    setPosition((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      positionRef.current = next;
      return next;
    });
  }, []);
  const [targetInfo, setTargetInfo] = useState(null);
  // default speaker (TTS) and mic are disabled by default
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const [popup, setPopup] = useState({ visible: false, text: '' });
  const [humanLike, setHumanLike] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showEnableHint, setShowEnableHint] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [pinned, setPinned] = useState(false);
  // hand gesture state: null or { left, top, sideMove }
  const [handStyle, setHandStyle] = useState(null);
  const lastMoveRef = useRef(Date.now()); // timestamp of last assistant move
  const suppressTargetsUntilRef = useRef(0); // timestamp until which scanning won't update targets
  // control when the hand gesture should be visible (ms since epoch)
  const handVisibleUntilRef = useRef(0);

  // conversation state (kept in ref for storage, and in state for rendering)
  const messagesRef = useRef([]); // conversation storage: {role: 'user'|'assistant', text}
  const [messagesState, setMessagesState] = useState([]);
  const [lastTranscript, setLastTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const targetsRef = useRef([]);
  const activeHighlightRef = useRef(null);
  const containerRef = useRef(null);
  const lastIndexRef = useRef(-1);
  const popupTimerRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const recognitionRef = useRef(null);
  const interactTimerRef = useRef(null);
  // suppressRoamRef prevents auto-roaming after general user interaction (click/scroll) but
  // does NOT cause the control panel to open. This keeps the control panel visible only when
  // the user actually hovers or focuses the assistant icon.
  const suppressRoamRef = useRef(false);
  const suppressRoamTimerRef = useRef(null);
  // when a control button is clicked, suppress hiding for 10s after leaving panel
  const buttonClickSuppressUntilRef = useRef(0);
  // schedule hide helper: clears existing timer and schedules setIsInteracting(false)
  const scheduleHide = useCallback((delayMs) => {
    try { clearTimeout(interactTimerRef.current); } catch (e) {}
    interactTimerRef.current = setTimeout(() => setIsInteracting(false), delayMs);
  }, []);

  // Inject keyframes for hand animation once
  useEffect(() => {
    if (!isPrimaryInstance) return;
    if (typeof document === 'undefined') return;
    if (document.getElementById('ra-hand-keyframes')) return;
    const s = document.createElement('style');
    s.id = 'ra-hand-keyframes';
    s.textContent = `@keyframes ra-hand-point { 0% { transform: translateX(0); } 50% { transform: translateX(var(--ra-hand-move, 8px)); } 100% { transform: translateX(0); } }`;
    document.head.appendChild(s);
    return () => { try { s.remove(); } catch (e) {} };
  }, [isPrimaryInstance]);

  // Position the hand attached to the bot and rotate it toward the highlighted element.
  // The hand sits at the assistant Fab and nudges forward/back along its pointing direction.
  useEffect(() => {
    if (!isPrimaryInstance) return;
    let mounted = true;
    const update = () => {
      try {
        const targetEl = targetInfo?.el;
        const botPos = positionRef.current || position;
        // only show the hand if handVisibleUntilRef hasn't expired
        if (!botPos || !targetEl || !mounted || Date.now() > handVisibleUntilRef.current) { if (mounted) setHandStyle(null); return; }
        // do not show the hand while user is interacting (control panel visible) to avoid covering controls
        if (isInteracting) { if (mounted) setHandStyle(null); return; }
        const hs = computeHandStyle(botPos, targetEl, handVisibleUntilRef.current, isInteracting, Date.now(), HAND_ROTATE_OFFSET);
        if (mounted) setHandStyle(hs);
      } catch (e) {
        if (mounted) setHandStyle(null);
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // also update periodically in case assistant moves due to roaming
    const id = setInterval(update, 700);
    return () => { mounted = false; window.removeEventListener('scroll', update); window.removeEventListener('resize', update); clearInterval(id); };
  }, [targetInfo, position, isInteracting, isPrimaryInstance]);

  // Popup timer cleanup
  const cleanupPopupTimer = useCallback(() => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }
  }, []);

  // show popup (stable reference)
  const showPopup = useCallback((text) => {
    cleanupPopupTimer();
    setPopup({ visible: true, text });
    popupTimerRef.current = setTimeout(() => setPopup({ visible: false, text: '' }), POPUP_DURATION);
  }, [cleanupPopupTimer]);

  // Remove a specific message (by index) from conversation
  const removeMessage = useCallback((index) => {
    const m = messagesRef.current[index];
    if (!m) return;
    const age = Date.now() - (m.timestamp || 0);
    if (age < 30_000) {
      showPopup('Message is protected for 30s and cannot be removed yet.');
      return;
    }
    // remove from ref
    messagesRef.current = messagesRef.current.filter((_, i) => i !== index);
    // update rendered state
    setMessagesState([...messagesRef.current]);
  }, [showPopup]);

  const clearAllMessages = useCallback(() => {
    const now = Date.now();
    // keep messages younger than 30s, remove older ones
    const remain = messagesRef.current.filter(m => (now - (m.timestamp || 0)) < 30_000);
    messagesRef.current = remain;
    setMessagesState([...messagesRef.current]);
    showPopup(remain.length ? 'Cleared older messages; recent messages kept for 30s.' : 'Cleared messages older than 30s.');
  }, [showPopup]);

  // stop any ongoing TTS
  const stopSpeaking = useCallback(() => {
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  }, []);

  // speak text using browser SpeechSynthesis (stable reference)
  const speak = useCallback((text) => {
    if (!speechEnabled) return;
    try {
      if ('speechSynthesis' in window) {
        stopSpeaking();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.7;
        u.pitch = 1;
        setIsSpeaking(true);
        u.onend = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
      console.warn('Speech synthesis failed', e);
    }
  }, [speechEnabled, stopSpeaking]);

  // Initialize SpeechRecognition for mic input
  useEffect(() => {
    if (!isPrimaryInstance) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let interim = '';

    rec.onresult = (event) => {
      let finalTranscript = '';
      interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) finalTranscript += res[0].transcript;
        else interim += res[0].transcript;
      }
      // show interim in popup so user sees what's being transcribed
      if (interim) showPopup(interim + ' ...');
      if (finalTranscript) {
        showPopup(finalTranscript);
        setLastTranscript(finalTranscript);
        // optional: speak acknowledgement
        if (speechEnabled) speak('Heard: ' + finalTranscript);
      }
    };

    rec.onerror = (e) => {
      console.warn('SpeechRecognition error', e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    return () => {
      try { recognitionRef.current && recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    };
  }, [showPopup, speak, speechEnabled, isPrimaryInstance]);

  // remove highlight (stable reference)
  const removeActiveHighlight = useCallback(() => {
    const el = activeHighlightRef.current;
    if (!el) return;
    try {
      delete el.dataset._assistantHighlighted;
      el.style.boxShadow = '';
      el.style.transform = '';
    } catch (e) {}
    activeHighlightRef.current = null;
    setTargetInfo(null);
    setAlertActive(false);
  }, []);

  const startListening = useCallback(() => {
    // Start the browser SpeechRecognition if available. Microphone is independent of speaker state.
    const rec = recognitionRef.current;
    if (!rec) return showPopup('Speech recognition not supported in this browser.');
    try {
      setIsListening(true);
      rec.start();
    } catch (e) {
      console.warn('startListening failed', e);
      setIsListening(false);
      showPopup('Failed to start microphone.');
    }
  }, [showPopup]);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try { rec.stop(); } catch (e) {}
    setIsListening(false);
  }, []);

  // Send captured transcript (or any text) to AI (mock) and handle response
  const sendToAI = useCallback(async (text) => {
    if (!text || text.trim() === '') return;
    // add user message to ref & state (include timestamp)
    messagesRef.current.push({ role: 'user', text, timestamp: Date.now() });
    setMessagesState([...messagesRef.current]);
    setLastTranscript('');
    // suppress target updates for 30s so list doesn't change immediately after user asks
    suppressTargetsUntilRef.current = Date.now() + 30_000;
    showPopup('Sending to AI...');
    // simulate network delay
    try {
      await new Promise(r => setTimeout(r, 900 + Math.random() * 800));
      const reply = `AI: I understood "${text.slice(0,120)}" — here's a suggested action.`;
      messagesRef.current.push({ role: 'assistant', text: reply, timestamp: Date.now() });
      setMessagesState([...messagesRef.current]);
      showPopup(reply);
      if (speechEnabled) speak(reply);
    } catch (e) {
      showPopup('Failed to get AI response.');
    }
  }, [showPopup, speak, speechEnabled]);

  // When humanLike is enabled, turn on speech and read out all messages (they'll queue in the synthesizer)
  useEffect(() => {
    if (humanLike) {
      setSpeechEnabled(true);
      // read the conversation (simple queue via speechSynthesis)
      for (const m of messagesRef.current) {
        try {
          const prefix = m.role === 'user' ? 'User said: ' : 'Assistant said: ';
          if ('speechSynthesis' in window) {
            const u = new SpeechSynthesisUtterance(prefix + m.text);
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
          }
        } catch (e) {}
      }
    }
  }, [humanLike]);

  // Track mouse position globally to detect proximity
  useEffect(() => {
    if (!isPrimaryInstance) return;
    const onMouseMoveGlobal = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMoveGlobal);
    // When the user interacts anywhere (click/touch/keydown), suppress roaming briefly but
    // do NOT open the control panel. This prevents clicks outside the assistant from showing
    // the controls while still preventing the assistant from moving unexpectedly.
    const onUserInteraction = () => {
      try { clearTimeout(suppressRoamTimerRef.current); } catch (e) {}
      suppressRoamRef.current = true;
      suppressRoamTimerRef.current = setTimeout(() => { suppressRoamRef.current = false; }, 4000);
    };
    window.addEventListener('mousedown', onUserInteraction);
    window.addEventListener('touchstart', onUserInteraction);
    window.addEventListener('keydown', onUserInteraction);
    return () => {
      window.removeEventListener('mousemove', onMouseMoveGlobal);
      window.removeEventListener('mousedown', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
      window.removeEventListener('keydown', onUserInteraction);
      try { clearTimeout(suppressRoamTimerRef.current); } catch (e) {}
    };
  }, [isPrimaryInstance]);

  useEffect(() => {
    if (!isPrimaryInstance) return;
    if (!enabled) return;

    // annotate demo important items so assistant finds them
    try { annotateImportantItems(); } catch (e) { /* ignore in SSR */ }

    const scan = () => {
      // if suppression period active, skip updating targets to avoid surprise list changes
      if (Date.now() < suppressTargetsUntilRef.current) return;
      // Priority: data-next-action then data-critical; deduplicate and keep DOM order
      const combined = collectTargets();

      // Preserve lastIndexRef if current highlighted element still exists in new list
      const prevEl = activeHighlightRef.current;
      if (prevEl) {
        const idx = combined.indexOf(prevEl);
        if (idx >= 0) {
          lastIndexRef.current = idx;
        } else {
          // If previous element removed, clamp index
          lastIndexRef.current = Math.max(0, Math.min(lastIndexRef.current, Math.max(0, combined.length - 1)));
        }
      } else {
        // keep lastIndexRef within bounds
        lastIndexRef.current = Math.max(0, Math.min(lastIndexRef.current, Math.max(0, combined.length - 1)));
      }

      targetsRef.current = combined;
    };

    scan();
    const id = setInterval(scan, SCAN_INTERVAL);
    return () => clearInterval(id);
  }, [enabled, isPrimaryInstance]);

  useEffect(() => {
    if (!isPrimaryInstance) return;
    if (!enabled || paused) return;

    const moveToTarget = (el) => {
      if (!el) return scheduleRoamRandomly();
      const pos = computeFabPositionForElement(el) || { left: 12, top: 120 };
      setPositionSafe(pos);
      lastMoveRef.current = Date.now();

      const info = formatInfoFromElement(el);
      setTargetInfo({ el, info });
      // show hand gesture for 7 seconds starting now for this task roam
      handVisibleUntilRef.current = Date.now() + 7000;

       // show alert indicator if this target is critical or has data-alert
      const isAlert = el.hasAttribute('data-critical') || el.hasAttribute('data-alert');
      setAlertActive(!!isAlert);

      // show popup and speak the message
      if (info) showPopup(info);
      if (info && speechEnabled) speak(info);

      // add highlight style
      try {
        removeActiveHighlight();
        el.dataset._assistantHighlighted = '1';
        el.style.transition = 'box-shadow 300ms ease, transform 300ms ease';
        el.style.boxShadow = '0 8px 20px rgba(25,118,210,0.35)';
        el.style.transform = 'translateY(-2px)';
        activeHighlightRef.current = el;
      } catch (e) {}
    };

    const scheduleRoamRandomly = () => {
      const left = Math.max(12, window.innerWidth - 120 - (Math.random() * 200));
      const top = Math.max(80, 120 + Math.random() * (window.innerHeight - 220));
      setTargetInfo(null);
      setAlertActive(false);
      removeActiveHighlight();
      setPositionSafe({ left, top });
      lastMoveRef.current = Date.now();
    };

    const step = () => {
      // if user mouse is close to assistant, or user is interacting/listening, skip roaming
      const mp = mousePosRef.current;
      const pos = positionRef.current || { left: 0, top: 0 };
      const dx = (mp.x || 0) - (pos.left || 0);
      const dy = (mp.y || 0) - (pos.top || 0);
      const distSq = dx * dx + dy * dy;
      const proximityThreshold = 80 * 80; // 80px
      if (distSq < proximityThreshold) {
        // do not move when user is hovering near the assistant
        return;
      }
      // suppressRoamRef blocks roaming after general user interactions (clicks) but does not
      // affect whether the control panel is visible (that's purely hover/focus-driven via isInteracting)
      if (isInteracting || isListening || pinned || suppressRoamRef.current) return;
      // enforce minimum dwell time of 30s since last move
      if (Date.now() - (lastMoveRef.current || 0) < 30_000) return;

      const targets = (targetsRef.current || []).filter(Boolean);
      if (targets.length === 0) {
        scheduleRoamRandomly();
      } else {
        lastIndexRef.current = (lastIndexRef.current + 1) % targets.length;
        const el = targets[lastIndexRef.current];
        moveToTarget(el);
      }
    };

    // start
    step();
    const tick = setInterval(() => {
      if (!paused) step();
    }, 4500);

    return () => clearInterval(tick);
  }, [enabled, paused, speechEnabled, showPopup, speak, removeActiveHighlight, setPositionSafe, isInteracting, isListening, pinned, isPrimaryInstance]);

  useEffect(() => {
    if (!isPrimaryInstance) return;
    return () => {
      removeActiveHighlight();
      cleanupPopupTimer();
      stopSpeaking();
      try { clearTimeout(interactTimerRef.current); } catch (e) {}
    };
  }, [removeActiveHighlight, cleanupPopupTimer, stopSpeaking, isPrimaryInstance]);

  const handleToggle = () => setEnabled(e => !e);
  const handlePauseToggle = () => setPaused(p => !p);
  const handlePrev = useCallback(() => {
    const targets = (targetsRef.current || []).filter(Boolean);
    if (targets.length === 0) {
      const left = Math.max(12, window.innerWidth - 120 - (Math.random() * 200));
      const top = Math.max(80, 120 + Math.random() * (window.innerHeight - 220));
      setPositionSafe({ left, top });
      lastMoveRef.current = Date.now();
      removeActiveHighlight();
      setTargetInfo(null);
      return;
    }
    // move backward in round-robin
    lastIndexRef.current = (lastIndexRef.current - 1 + targets.length) % targets.length;
    const el = targets[lastIndexRef.current];
    if (!el) return;
    const pos = computeFabPositionForElement(el) || { left: 12, top: 120 };
    setPositionSafe(pos);
    lastMoveRef.current = Date.now();
    // prevent roaming and list updates briefly after manual navigation
    setIsInteracting(true);
    suppressTargetsUntilRef.current = Date.now() + 30_000;
    setTimeout(() => setIsInteracting(false), 4000);
    const info = formatInfoFromElement(el);
    setTargetInfo({ el, info });
    removeActiveHighlight();
    try {
      el.dataset._assistantHighlighted = '1';
      el.style.transition = 'box-shadow 300ms ease, transform 300ms ease';
      el.style.boxShadow = '0 8px 20px rgba(25,118,210,0.35)';
      el.style.transform = 'translateY(-2px)';
      activeHighlightRef.current = el;
    } catch (e) {}
    const isAlert = el.hasAttribute('data-critical') || el.hasAttribute('data-alert');
    setAlertActive(!!isAlert);
    if (info) showPopup(info);
    if (info && speechEnabled) speak(info);
    if (humanLike && info) showPopup(personalize(info));
  }, [removeActiveHighlight, showPopup, speak, speechEnabled, humanLike, setPositionSafe]);
  const handleNext = useCallback(() => {
     const targets = (targetsRef.current || []).filter(Boolean);
     if (targets.length === 0) {
       const left = Math.max(12, window.innerWidth - 120 - (Math.random() * 200));
       const top = Math.max(80, 120 + Math.random() * (window.innerHeight - 220));
       setPositionSafe({ left, top });
       lastMoveRef.current = Date.now();
       removeActiveHighlight();
       setTargetInfo(null);
     } else {
       lastIndexRef.current = (lastIndexRef.current + 1) % targets.length;
       const el = targets[lastIndexRef.current];
       if (el) {
         const pos = computeFabPositionForElement(el) || { left: 12, top: 120 };
         setPositionSafe(pos);
         lastMoveRef.current = Date.now();
         // prevent roaming and list updates briefly after manual navigation
         setIsInteracting(true);
         suppressTargetsUntilRef.current = Date.now() + 30_000;
         setTimeout(() => setIsInteracting(false), 4000);
         const info = formatInfoFromElement(el);
         setTargetInfo({ el, info });
         removeActiveHighlight();
         try {
           el.dataset._assistantHighlighted = '1';
           el.style.transition = 'box-shadow 300ms ease, transform 300ms ease';
           el.style.boxShadow = '0 8px 20px rgba(25,118,210,0.35)';
           el.style.transform = 'translateY(-2px)';
           activeHighlightRef.current = el;
         } catch (e) {}
         const isAlert = el.hasAttribute('data-critical') || el.hasAttribute('data-alert');
         setAlertActive(!!isAlert);
         if (info) showPopup(info);
         if (info && speechEnabled) speak(info);
         // optionally produce a conversational popup when in humanLike mode
         if (humanLike && info) showPopup(personalize(info));
       }
     }
   }, [setPositionSafe, showPopup, speak, speechEnabled, humanLike, removeActiveHighlight]);

  // Drag handling so user can reposition the assistant (smooth)
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const startDrag = useCallback((e) => {
     draggingRef.current = true;
     setIsDragging(true);
     dragStartRef.current = { x: e.clientX, y: e.clientY };
     // attach global listeners so dragging continues even if cursor leaves the component
     const onMove = (ev) => {
       if (!draggingRef.current) return;
       const dx = ev.clientX - dragStartRef.current.x;
       const dy = ev.clientY - dragStartRef.current.y;
       setPositionSafe(prev => ({ left: Math.max(8, prev.left + dx), top: Math.max(8, prev.top + dy) }));
       dragStartRef.current = { x: ev.clientX, y: ev.clientY };
     };
     const onUp = () => {
       draggingRef.current = false;
       setIsDragging(false);
       setIsInteracting(false);
       lastMoveRef.current = Date.now();
       window.removeEventListener('mousemove', onMove);
       window.removeEventListener('mouseup', onUp);
     };
     window.addEventListener('mousemove', onMove);
     window.addEventListener('mouseup', onUp);
     e.preventDefault();
     // startInteraction while dragging
     setIsInteracting(true);
     lastMoveRef.current = Date.now();
  }, [setPositionSafe, setIsInteracting]);

  // Toggle speech and stop ongoing speech when muting
  const toggleSpeech = useCallback(() => {
    if (speechEnabled) {
      // turning off: stop any ongoing synthesis immediately
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
      setSpeechEnabled(false);
      // Do NOT stop the microphone when muting speech; mic is independent now.
      showPopup('Assistant speech muted.');
    } else {
      // turn on speech and, after state updates, speak the most recent assistant or popup text
      setSpeechEnabled(true);
      showPopup('Assistant speech enabled.');
      setTimeout(() => {
        try {
          const recent = messagesRef.current[messagesRef.current.length - 1];
          if (recent && recent.role === 'assistant') {
            speak(recent.text);
          } else if (popup.visible) {
            speak(popup.text);
          }
        } catch (e) {}
      }, 120);
    }
  }, [speechEnabled, popup.text, popup.visible, speak, showPopup]);

  // handle enable-FAB two-step: show hint first, then enable on second click
  const handleDisabledFabClick = useCallback(() => {
    if (!showEnableHint) {
      setShowEnableHint(true);
      // auto-hide hint after a few seconds
      setTimeout(() => setShowEnableHint(false), 6000);
    } else {
      setEnabled(true);
      setShowEnableHint(false);
    }
  }, [showEnableHint]);

  if (!enabled) return (
    <Box sx={{ position: 'fixed', right: 18, bottom: 18, zIndex: 1400 }}>
      <Tooltip title={showEnableHint ? 'Click again to enable assistant' : 'Assistant disabled - click to learn more'}>
        <Fab size="small" color="primary" onClick={handleDisabledFabClick} aria-label="enable-assistant">
          <SmartToyIcon />
        </Fab>
      </Tooltip>
    </Box>
  );


  // show controls when user is interacting (hover/focus), or when popup/enable-hint is visible
  const handleMouseEnter = () => {
    try { clearTimeout(interactTimerRef.current); } catch (e) {}
    setIsInteracting(true);
  };
  const handleMouseLeave = () => {
    try { clearTimeout(interactTimerRef.current); } catch (e) {}
    // default hide delay is 3s; if a control button was clicked recently, wait longer (up to remaining time)
    const now = Date.now();
    const remaining = buttonClickSuppressUntilRef.current > now ? (buttonClickSuppressUntilRef.current - now) : 0;
    const delay = remaining > 0 ? Math.max(3000, remaining) : 3000;
    scheduleHide(delay);
  };

  // derived flag to indicate controls/assistant are active (used for styling)
  // ONLY show controls when user is interacting (hover/focus) or when the enable hint is active.
  // Do NOT show controls when the assistant is auto-roaming or only showing a popup.
  const controlActive = isInteracting || showEnableHint;
  // shared button styles for dim + dip effect when active
  const btnSx = controlActive ? {
    backgroundColor: 'rgba(0,0,0,0.04)',
    boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.06)',
    transform: 'translateY(1px)',
  } : {};

  if (!isPrimaryInstance) return null;

  return (
    <Box
      ref={containerRef}
      onMouseDown={startDrag}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      sx={{ position: 'fixed', left: position.left, top: position.top, zIndex: 1400, transition: isDragging ? 'none' : `all ${TRANSITION_MS}ms cubic-bezier(.2,.8,.2,1)` , cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <Tooltip title={targetInfo?.info || 'Assistant — shows next action / critical items'} enterDelay={200} leaveDelay={100}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            {/* small bot backdrop (dim + dip) to make the assistant icon stand out when controls are active */}
            {controlActive && (
               <Box aria-hidden sx={{ position: 'absolute', left: -6, top: -6, width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.03)', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.06)', transform: 'translateY(2px)', pointerEvents: 'none' }} />
             )}
            <Badge color="error" variant="dot" invisible={!alertActive} overlap="circular">
              <Fab size="small" color="secondary" aria-label="assistant" sx={controlActive ? { transform: 'translateY(2px)', boxShadow: '0 8px 18px rgba(0,0,0,0.08)' } : {}}>
                <SmartToyIcon />
              </Fab>
            </Badge>
          </Box>
        </Tooltip>

      {/* Animated hand attached to the bot and pointing toward the highlighted element */}
      {handStyle && (
        <Box aria-hidden sx={{ position: 'fixed', left: handStyle.left, top: handStyle.top, zIndex: 1395, width: 36, height: 36, pointerEvents: 'none', transform: 'translate(0,0)' }}>
          <Box sx={{ transform: `rotate(${handStyle.rotate}deg)`, transformOrigin: '50% 50%', width: 36, height: 36, display: 'inline-block' }}>
            <Box sx={{ display: 'inline-block', '--ra-hand-move': `${handStyle.move}px`, animation: 'ra-hand-point 1.2s ease-in-out infinite', color: 'primary.main' }}>
              {/* Inline SVG hand pointer - predictable default orientation so HAND_ROTATE_OFFSET is minimal */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M6 10c0-1.1.9-2 2-2v0c.55 0 1 .45 1 1v5.59l1.29-1.3a1 1 0 011.42 0L15 15.59V7a1 1 0 112 0v6.59l1.3-1.29a1 1 0 011.42 0l1.59 1.59V20a1 1 0 01-1 1H7a3 3 0 01-1-5.83V10z" fill="currentColor" />
              </svg>
            </Box>
          </Box>
        </Box>
      )}

       {/* small dim/dip background to focus attention when controls are visible */}
      {(isInteracting || showEnableHint) && (
        // softened and slightly smaller dim/dip so it does not look like a stray transparent box
        <Box aria-hidden sx={{ position: 'absolute', left: -4, top: 44, width: 220, height: 64, borderRadius: 2, backgroundColor: 'rgba(15,23,42,0.02)', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.04)', transform: 'translateY(2px)', transition: 'opacity 180ms ease, transform 180ms ease', pointerEvents: 'none' }} />
      )}

      {/* small control panel (hidden by default) */}
      {(isInteracting || showEnableHint) && (
      <Paper elevation={8}
         onMouseDown={(e) => { e.stopPropagation(); try { clearTimeout(interactTimerRef.current); } catch (err) {} setIsInteracting(true); }}
         onMouseUp={(e) => { e.stopPropagation(); try { clearTimeout(interactTimerRef.current); } catch (err) {}
            // when mouse up inside panel, keep it visible; schedule hide according to button click suppression
            const now = Date.now();
            const remaining = buttonClickSuppressUntilRef.current > now ? (buttonClickSuppressUntilRef.current - now) : 0;
            const delay = remaining > 0 ? Math.max(3000, remaining) : 3000;
            scheduleHide(delay);
         }}
         sx={{ mt: 1, p: 0.5, display: 'flex', gap: 0.5, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)' }}>
        <Tooltip title={paused ? 'Resume roaming' : 'Pause roaming'} enterDelay={200} leaveDelay={100}>
          <IconButton size="small" onClick={(e)=>{ if (e && e.stopPropagation) e.stopPropagation(); handlePauseToggle(); buttonClickSuppressUntilRef.current = Date.now() + 10000; setIsInteracting(true); }} aria-label="pause" sx={btnSx}>
            {paused ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Previous important item" enterDelay={200} leaveDelay={100}>
          <IconButton size="small" onClick={(e)=>{ if (e && e.stopPropagation) e.stopPropagation(); handlePrev(); buttonClickSuppressUntilRef.current = Date.now() + 10000; setIsInteracting(true); }} aria-label="prev" sx={btnSx}>
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Jump to next important item" enterDelay={200} leaveDelay={100}>
          <IconButton size="small" onClick={(e)=>{ if (e && e.stopPropagation) e.stopPropagation(); handleNext(); buttonClickSuppressUntilRef.current = Date.now() + 10000; setIsInteracting(true); }} aria-label="next" sx={btnSx}>
            <NavigateNextIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={speechEnabled ? 'Mute assistant speech' : 'Unmute assistant speech'} enterDelay={200} leaveDelay={100}>
          <IconButton size="small" onClick={(e)=>{ if (e && e.stopPropagation) e.stopPropagation(); toggleSpeech(); buttonClickSuppressUntilRef.current = Date.now() + 10000; setIsInteracting(true); }} aria-label="toggle-speech" sx={btnSx}>
            {speechEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Improved mic button: reflect speaker state and listening state clearly */}
        <Tooltip title={isListening ? 'Stop listening' : 'Start listening'} enterDelay={200} leaveDelay={100}>
          <IconButton size="small" onClick={(e)=>{ if (e && e.stopPropagation) e.stopPropagation(); setIsInteracting(true); if (isListening) stopListening(); else startListening(); buttonClickSuppressUntilRef.current = Date.now() + 10000; setTimeout(() => setIsInteracting(false), 5000); }} aria-label="toggle-listen" sx={btnSx}>
            {/* Microphone is always present; show active state when listening */}
            <MicIcon fontSize="small" color={isListening ? 'error' : 'primary'} />
          </IconButton>
        </Tooltip>

        <Tooltip title={humanLike ? 'Human-like interactions: on' : 'Human-like interactions: off'} enterDelay={200} leaveDelay={100}>
          <IconButton size="small" onClick={(e)=>{ if (e && e.stopPropagation) e.stopPropagation(); setHumanLike(h => { const next = !h; if (next) { setSpeechEnabled(true); setTimeout(() => { for (const m of messagesRef.current) { try { const prefix = m.role === 'user' ? 'User said: ' : 'Assistant said: '; if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(prefix + m.text); u.rate = 0.9; window.speechSynthesis.speak(u); } } catch (e) {} } }, 150); } return next; }); buttonClickSuppressUntilRef.current = Date.now() + 10000; setIsInteracting(true); }} aria-label="toggle-humanlike" sx={btnSx}>
            {humanLike ? <PersonIcon fontSize="small" /> : <PersonOffIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title={pinned ? 'Unpin assistant (allow roaming)' : 'Pin assistant (prevent auto-roam)'} enterDelay={200} leaveDelay={100}>
          <IconButton size="small" onClick={(e)=>{ if (e && e.stopPropagation) e.stopPropagation(); setPinned(p => !p); setIsInteracting(true); setTimeout(() => setIsInteracting(false), 800); buttonClickSuppressUntilRef.current = Date.now() + 10000; }} aria-label="pin" sx={btnSx}>
            <PushPinIcon fontSize="small" color={pinned ? 'primary' : 'disabled'} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Disable assistant (hide)" enterDelay={200} leaveDelay={100}>
          <IconButton size="small" onClick={(e)=>{ if (e && e.stopPropagation) e.stopPropagation(); handleToggle(); buttonClickSuppressUntilRef.current = Date.now() + 10000; }} aria-label="close" sx={btnSx}>
            <SmartToyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
         <Box sx={{ ml: 1, mr: 1 }}>
           <Typography variant="caption">{targetInfo?.info ? (targetInfo.info.length > 60 ? targetInfo.info.slice(0,60) + '...' : targetInfo.info) : 'Roaming...'}</Typography>
         </Box>
       </Paper>
      )}

      {/* Popup message panel near the assistant */}
      {popup.visible && (
        <Paper elevation={6} onMouseDown={(e) => { e.stopPropagation(); try { clearTimeout(interactTimerRef.current); } catch (err) {} setIsInteracting(true); }} onMouseUp={(e) => { e.stopPropagation(); interactTimerRef.current = setTimeout(() => setIsInteracting(false), 800); }} sx={{ mt: 1, p: 1, maxWidth: 400, backgroundColor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
            <SmartToyIcon color="primary" sx={{ mt: '3px' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{popup.text}</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption">Status: {isSpeaking ? 'Speaking' : (speechEnabled ? 'Speech on' : 'Muted')}</Typography>
                {messagesState.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption">Recent messages</Typography>
                      <Tooltip title="Clear all messages" enterDelay={200} leaveDelay={100}><IconButton size="small" onClick={(e)=>{ if (e && e.stopPropagation) e.stopPropagation(); clearAllMessages(); buttonClickSuppressUntilRef.current = Date.now() + 10000; }} sx={btnSx}><ClearIcon fontSize="small" /></IconButton></Tooltip>
                    </Box>
                    {(() => {
                      const visible = messagesState.slice(-5);
                      const offset = messagesState.length - visible.length;
                      return visible.map((m, i) => {
                        const globalIndex = offset + i;
                        const age = Date.now() - (m.timestamp || 0);
                        const removable = age >= 30_000;
                        return (
                          <Box key={globalIndex} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography variant="caption" sx={{ display: 'block', flex: 1 }}>
                              {m.role === 'user' ? 'You: ' : 'Bot: '}{m.text}
                            </Typography>
                            <Tooltip title={removable ? 'Remove message' : 'Cannot remove for 30s'} enterDelay={100} leaveDelay={100}>
                              <span>
                                <IconButton size="small" disabled={!removable} onClick={(e)=>{ if (e && e.stopPropagation) e.stopPropagation(); removeMessage(globalIndex); buttonClickSuppressUntilRef.current = Date.now() + 10000; }} sx={btnSx}>
                                  <ClearIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        );
                      });
                    })()}
                  </Box>
                )}
              </Box>
              {/* When we have a last transcript allow sending it to AI */}
              {lastTranscript && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button size="small" variant="contained" startIcon={<SendIcon />} onClick={(e) => { if (e && e.stopPropagation) e.stopPropagation(); setIsInteracting(true); sendToAI(lastTranscript); buttonClickSuppressUntilRef.current = Date.now() + 10000; setTimeout(() => setIsInteracting(false), 4000); }}>
                    Send
                  </Button>
                  <Button size="small" onClick={() => setLastTranscript('')}>Clear</Button>
                </Box>
              )}
              {/* show direct action link if target has it */}
              {targetInfo?.el && targetInfo.el.getAttribute && targetInfo.el.getAttribute('data-assistant-link') && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<OpenInNewIcon />} onClick={() => {
                    const link = targetInfo.el.getAttribute('data-assistant-link');
                    if (link) window.open(link, '_blank');
                  }}>Open</Button>
                  <Button size="small" onClick={() => { cleanupPopupTimer(); setPopup({ visible: false, text: '' }); }}>Dismiss</Button>
                </Box>
              )}
            </Box>
            <IconButton size="small" onClick={() => { cleanupPopupTimer(); setPopup({ visible: false, text: '' }); }} aria-label="close-popup">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
