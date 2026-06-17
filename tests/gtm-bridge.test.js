import { describe, it, expect, beforeEach, vi } from 'vitest';
import { init } from '../src/plugin.js';
import { createConsentRecord, mapConsentToGoogle } from '../src/consent-mode.js';
import { writeConsentCookie } from '../src/cookie-storage.js';
import { installGtmBridge, notifyGtmConsentListeners } from '../src/gtm-bridge.js';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('plugin GTM bridge', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.cookie = 'cp_cookie_consent=; Max-Age=0; Path=/';
    window.CookiePluginLoaded = false;
    window.dataLayer = [];
    delete window.CookiePluginGtmConsentActive;
    window.CookiePluginConfig = {
      consentVersion: 1,
      cookieName: 'cp_cookie_consent',
    };
    vi.restoreAllMocks();
  });

  it('delegates consent updates to the GTM template bridge', async () => {
    installGtmBridge();
    window.CookiePlugin_setGtmConsentActive(true);

    const listener = vi.fn((consent) => {
      window.dataLayer.push({
        event: 'cp_consent_update',
        consent: {
          functional: consent.functional,
          analytics: consent.analytics,
          marketing: consent.marketing,
        },
      });
    });
    window.CookiePlugin_addGtmConsentListener(listener);

    init();
    await flushPromises();

    document.querySelector('.cp-btn-accept')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].source).toBe('accept_all');
    expect(window.dataLayer).toContainEqual({
      event: 'cp_consent_update',
      consent: {
        functional: true,
        analytics: true,
        marketing: true,
      },
    });
  });

  it('does not call gtag consent update when GTM template is active', async () => {
    installGtmBridge();
    window.CookiePlugin_setGtmConsentActive(true);
    window.CookiePlugin_addGtmConsentListener(() => {});

    const consent = createConsentRecord(true, true, 'accept_all', 1);
    writeConsentCookie('cp_cookie_consent', consent, 180);
    const gtag = vi.fn();
    window.gtag = gtag;

    init();
    await flushPromises();

    const consentCalls = window.dataLayer.filter(
      (entry) => Array.isArray(entry) && entry[0] === 'consent'
    );

    expect(consentCalls).toHaveLength(0);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('merges listeners registered before plugin init', () => {
    const earlyListener = vi.fn();
    window.CookiePlugin_gtmConsentListeners = [earlyListener];

    installGtmBridge();
    notifyGtmConsentListeners(createConsentRecord(true, false, 'custom', 1));

    expect(earlyListener).toHaveBeenCalledTimes(1);
  });
});
