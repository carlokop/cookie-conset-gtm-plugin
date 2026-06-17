import { mergeConfig } from './config.js';
import { readScriptConfig } from './script-config.js';
import { readConsentCookie, writeConsentCookie, isConsentValid } from './cookie-storage.js';
import { applyConsentUpdateAndWait } from './consent-api.js';
import {
  applyDefaultConsent,
  createConsentRecord,
  mapConsentToGoogle,
} from './consent-mode.js';
import {
  installGtmBridge,
  isGtmConsentActive,
  notifyGtmConsentListeners,
} from './gtm-bridge.js';
import { resolveInventory } from './inventory.js';
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
  installGtmBridge();
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

  if (!isGtmConsentActive()) {
    applyDefaultConsent(window.gtag, config.consentWaitForUpdateMs);
  }

  startPlugin(config);
}

/**
 * @param {import('./config.js').DEFAULT_CONFIG} config
 */
/**
 * @param {import('./consent-mode.js').ConsentRecord} consent
 */
function pushConsentUpdateEvent(consent, consentMode) {
  window.dataLayer.push({
    event: 'cp_consent_update',
    consent: {
      functional: consent.functional,
      analytics: consent.analytics,
      marketing: consent.marketing,
    },
    consentMode,
  });
}

/**
 * @param {import('./consent-mode.js').ConsentRecord} consent
 */
function applyConsentAndNotify(consent) {
  if (isGtmConsentActive()) {
    notifyGtmConsentListeners(consent);
    return;
  }

  const consentMode = mapConsentToGoogle(consent);
  applyConsentUpdateAndWait(window.gtag, consentMode, () => {
    pushConsentUpdateEvent(consent, consentMode);
  });
}

async function startPlugin(config) {
  const savedConsent = readConsentCookie(config.cookieName);

  if (isConsentValid(savedConsent, config.consentVersion)) {
    if (!isGtmConsentActive()) {
      applyConsentAndNotify(savedConsent);
    }
    exposeApi(config, savedConsent);
    return;
  }

  const inventory = await resolveInventory(config);

  let uiInstance = null;

  function saveAndUpdate(analytics, marketing, source) {
    const consent = createConsentRecord(
      analytics,
      marketing,
      source,
      config.consentVersion
    );

    writeConsentCookie(config.cookieName, consent, config.cookieMaxAgeDays);
    applyConsentAndNotify(consent);
    exposeApi(config, consent);

    if (uiInstance) {
      uiInstance.destroy();
      uiInstance = null;
    }
  }

  function createUi() {
    return renderConsentUI(config, inventory, {
      onAcceptAll: () => saveAndUpdate(true, true, 'accept_all'),
      onRejectAll: () => saveAndUpdate(false, false, 'reject_all'),
      onSavePreferences: (preferences) =>
        saveAndUpdate(preferences.analytics, preferences.marketing, 'custom'),
    });
  }

  uiInstance = createUi();

  exposeApi(config, null, {
    openPreferences: () => {
      if (uiInstance) {
        uiInstance.showPreferences();
      } else {
        uiInstance = createUi();
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
