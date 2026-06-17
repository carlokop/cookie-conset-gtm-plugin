/** @typedef {import('./consent-mode.js').GoogleConsentMode} GoogleConsentMode */

const POLL_INTERVAL_MS = 10;
const MAX_WAIT_MS = 10000;

/**
 * @param {unknown} value
 * @returns {'granted' | 'denied' | null}
 */
function normalizeConsentValue(value) {
  if (value === 'granted' || value === true || value === 1) {
    return 'granted';
  }
  if (value === 'denied' || value === false || value === 0) {
    return 'denied';
  }
  return null;
}

/**
 * @param {string} type
 * @returns {'granted' | 'denied' | null}
 */
export function getGtmConsentValue(type) {
  if (typeof window === 'undefined') {
    return null;
  }

  const ics = window.google_tag_data?.ics;
  if (!ics) {
    return null;
  }

  const entry = ics.entries?.[type];

  if (typeof ics.getConsentState === 'function') {
    try {
      const state = ics.getConsentState(type);
      if (state !== undefined) {
        return normalizeConsentValue(state);
      }
    } catch {
      // Fall through to entries lookup.
    }
  }

  if (!entry) {
    return null;
  }

  return normalizeConsentValue(entry.update ?? entry.default ?? entry.initial);
}

/**
 * @param {GoogleConsentMode} consentMode
 * @returns {boolean}
 */
export function isConsentModeApplied(consentMode) {
  return Object.entries(consentMode).every(([type, expected]) => {
    return getGtmConsentValue(type) === expected;
  });
}

/**
 * @param {GoogleConsentMode} consentMode
 * @param {(consentMode: GoogleConsentMode) => void} onApplied
 * @returns {() => void}
 */
export function waitForConsentApplied(consentMode, onApplied) {
  const start = Date.now();
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timeoutId;

  const poll = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (isConsentModeApplied(consentMode)) {
      onApplied(consentMode);
      return;
    }

    if (Date.now() - start >= MAX_WAIT_MS) {
      return;
    }

    timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
  };

  poll();

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * @param {GoogleConsentMode} consentMode
 */
export function pushConsentUpdateCommand(consentMode) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(['consent', 'update', consentMode]);
}

/**
 * Standalone / non-GTM fallback.
 *
 * @param {Function} gtag
 * @param {GoogleConsentMode} consentMode
 * @param {(consentMode: GoogleConsentMode) => void} onApplied
 */
export function applyConsentUpdateAndWait(gtag, consentMode, onApplied) {
  let notified = false;
  let cancelPoll = () => {};

  const notify = () => {
    if (notified) {
      return;
    }
    notified = true;
    cancelPoll();
    onApplied(consentMode);
  };

  pushConsentUpdateCommand(consentMode);
  gtag('consent', 'update', consentMode, notify);
  cancelPoll = waitForConsentApplied(consentMode, notify);
}
