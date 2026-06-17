import { mergeConfig } from './config.js';
import { readScriptConfig } from './script-config.js';
import { readConsentCookie, writeConsentCookie, isConsentValid } from './cookie-storage.js';
import {
  applyDefaultConsent,
  applyConsentUpdate,
  createConsentRecord,
} from './consent-mode.js';
import { renderConsentUI } from './ui.js';

const GLOBAL_KEY = 'CookiePlugin';

/**
 * @param {Partial<import('./config.js').DEFAULT_CONFIG>} [userConfig]
 */
export function init(userConfig) {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.CookiePluginLoaded) {
    return;
  }
  window.CookiePluginLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  const config = mergeConfig({
    ...readScriptConfig(),
    ...(window.CookiePluginConfig || {}),
    ...(userConfig || {}),
  });

  applyDefaultConsent(window.gtag);

  const savedConsent = readConsentCookie(config.cookieName);

  if (isConsentValid(savedConsent, config.consentVersion)) {
    applyConsentUpdate(window.gtag, savedConsent);
    exposeApi(config, savedConsent);
    return;
  }

  let uiInstance = null;

  function saveAndUpdate(analytics, marketing, source) {
    const consent = createConsentRecord(
      analytics,
      marketing,
      source,
      config.consentVersion
    );

    writeConsentCookie(config.cookieName, consent, config.cookieMaxAgeDays);

    const consentMode = applyConsentUpdate(window.gtag, consent);

    window.dataLayer.push({
      event: 'cp_consent_update',
      consent: {
        functional: consent.functional,
        analytics: consent.analytics,
        marketing: consent.marketing,
      },
      consentMode,
    });

    exposeApi(config, consent);

    if (uiInstance) {
      uiInstance.destroy();
      uiInstance = null;
    }
  }

  uiInstance = renderConsentUI(config, {
    onAcceptAll: () => saveAndUpdate(true, true, 'accept_all'),
    onRejectAll: () => saveAndUpdate(false, false, 'reject_all'),
    onSavePreferences: (preferences) =>
      saveAndUpdate(preferences.analytics, preferences.marketing, 'custom'),
  });

  exposeApi(config, null, {
    openPreferences: () => {
      if (uiInstance) {
        uiInstance.showPreferences();
      } else {
        uiInstance = renderConsentUI(config, {
          onAcceptAll: () => saveAndUpdate(true, true, 'accept_all'),
          onRejectAll: () => saveAndUpdate(false, false, 'reject_all'),
          onSavePreferences: (preferences) =>
            saveAndUpdate(preferences.analytics, preferences.marketing, 'custom'),
        });
        uiInstance.showPreferences();
      }
    },
  });
}

/**
 * @param {import('./config.js').DEFAULT_CONFIG} config
 * @param {import('./consent-mode.js').ConsentRecord | null} consent
 * @param {{ openPreferences?: () => void }} [extra]
 */
function exposeApi(config, consent, extra = {}) {
  window[GLOBAL_KEY] = {
    getConsent: () => consent || readConsentCookie(config.cookieName),
    openPreferences: extra.openPreferences || (() => {}),
  };
}
