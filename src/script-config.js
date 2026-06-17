/**
 * Leest configuratie uit data-attributen op het script-element.
 * @param {HTMLScriptElement | null} [script]
 * @returns {Partial<import('./config.js').DEFAULT_CONFIG>}
 */
export function readScriptConfig(script = getLoadingScript()) {
  if (!script) {
    return {};
  }

  const privacyPolicyUrl =
    script.getAttribute('data-privacy-policy-url') ||
    script.dataset.privacyPolicyUrl ||
    '';

  const config = {};

  if (privacyPolicyUrl) {
    config.privacyPolicyUrl = privacyPolicyUrl;
  }

  return config;
}

/**
 * @returns {HTMLScriptElement | null}
 */
function getLoadingScript() {
  if (typeof document === 'undefined') {
    return null;
  }

  if (document.currentScript instanceof HTMLScriptElement) {
    return document.currentScript;
  }

  const scripts = document.querySelectorAll('script[src*="cookie-consent"]');
  const lastScript = scripts[scripts.length - 1];

  return lastScript instanceof HTMLScriptElement ? lastScript : null;
}
