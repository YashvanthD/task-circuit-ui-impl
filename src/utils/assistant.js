// Small reusable assistant helpers moved out of the component so the UI stays
// clean. Keep these pure where possible so they're easy to test.

export const HAND_ROTATE_OFFSET = 90;

export function personalize(text) {
  const prefixes = [
    'Heads up —',
    'FYI —',
    'Quick note —',
    'I noticed —',
  ];
  return prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' + text;
}

export function computeTargetCenter(el) {
  if (!el || !el.getBoundingClientRect) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: window.scrollX + rect.left + rect.width / 2,
    y: window.scrollY + rect.top + rect.height / 2,
  };
}

// Given bot position and a target element, compute an inline hand style or null.
export function computeHandStyle(botPos, targetEl, handVisibleUntil, isInteracting, now = Date.now(), handRotateOffset = HAND_ROTATE_OFFSET) {
  try {
    if (!botPos || !targetEl) return null;
    if (now > (handVisibleUntil || 0)) return null;
    if (isInteracting) return null;
    const rect = targetEl.getBoundingClientRect();
    const targetX = window.scrollX + rect.left + rect.width / 2;
    const targetY = window.scrollY + rect.top + rect.height / 2;
    const botCenterX = (botPos.left || 0) + 20;
    const botCenterY = (botPos.top || 0) + 20;
    const dx = targetX - botCenterX;
    const dy = targetY - botCenterY;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = angleRad * (180 / Math.PI) + handRotateOffset;
    const offsetDistance = 18;
    const left = Math.round(botCenterX + Math.cos(angleRad) * offsetDistance - 18);
    const top = Math.round(botCenterY + Math.sin(angleRad) * offsetDistance - 18);
    const move = 10;
    return { left, top, rotate: angleDeg, move };
  } catch (e) {
    return null;
  }
}

// Compute convenient Fab (assistant) position so it sits near an element
export function computeFabPositionForElement(el) {
  if (!el || !el.getBoundingClientRect) return null;
  const rect = el.getBoundingClientRect();
  const left = Math.max(8, window.scrollX + rect.left - 48);
  const top = Math.max(8, window.scrollY + rect.top - 48);
  return { left, top };
}

export function formatInfoFromElement(el) {
  if (!el) return '';
  return el.getAttribute('data-next-action') || el.getAttribute('data-critical') || el.getAttribute('title') || (el.innerText && el.innerText.slice(0, 80)) || '';
}

// Collect important targets in DOM (next-action first, then critical) and
// preserve DOM order while deduplicating.
export function collectTargets() {
  const nexts = Array.from(document.querySelectorAll('[data-next-action]'));
  const criticals = Array.from(document.querySelectorAll('[data-critical]'));
  const combined = [];
  const seen = new Set();
  for (const el of nexts) {
    if (!seen.has(el)) { combined.push(el); seen.add(el); }
  }
  for (const el of criticals) {
    if (!seen.has(el)) { combined.push(el); seen.add(el); }
  }
  return combined;
}

