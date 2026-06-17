/** @typedef {import('./consent-mode.js').ConsentRecord} ConsentRecord */
/** @typedef {import('./consent-mode.js').GoogleConsentMode} GoogleConsentMode */

/** @type {Array<(consent: ConsentRecord) => void>} */
const gtmConsentListeners = [];

/**
 * @param {(consent: ConsentRecord) => void} callback
 */
export function addGtmConsentListener(callback) {
  gtmConsentListeners.push(callback);
}

/**
 * @param {ConsentRecord} consent
 */
export function notifyGtmConsentListeners(consent) {
  for (const listener of gtmConsentListeners) {
    listener(consent);
  }
}

/**
 * @returns {boolean}
 */
export function isGtmConsentActive() {
  return Boolean(window.CookiePluginGtmConsentActive);
}

/**
 * @param {Record<string, unknown>} payload
 */
export function pushDataLayerEvent(payload) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/**
 * Registers the bridge API used by the GTM custom template.
 */
export function installGtmBridge() {
  const pending = window.CookiePlugin_gtmConsentListeners || [];

  window.CookiePlugin_addGtmConsentListener = addGtmConsentListener;
  window.CookiePlugin_pushDataLayerEvent = pushDataLayerEvent;
  window.CookiePlugin_setGtmConsentActive = (active) => {
    window.CookiePluginGtmConsentActive = Boolean(active);
  };

  for (const listener of pending) {
    if (typeof listener === 'function') {
      addGtmConsentListener(listener);
    }
  }
}
