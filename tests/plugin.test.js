import { describe, it, expect, beforeEach } from 'vitest';
import { init } from '../src/plugin.js';
import { createConsentRecord } from '../src/consent-mode.js';
import { writeConsentCookie } from '../src/cookie-storage.js';

describe('plugin init flow', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.cookie = 'cp_cookie_consent=; Max-Age=0; Path=/';
    window.CookiePluginLoaded = false;
    window.dataLayer = [];
    window.CookiePluginConfig = {
      consentVersion: 1,
      cookieName: 'cp_cookie_consent',
    };
  });

  it('shows banner when no consent cookie exists', () => {
    init();

    expect(document.querySelector('.cp-overlay')).not.toBeNull();
    expect(document.querySelector('[data-panel="consent"]')).not.toBeNull();
  });

  it('does not show banner when valid consent cookie exists', () => {
    const consent = createConsentRecord(true, true, 'accept_all', 1);
    writeConsentCookie('cp_cookie_consent', consent, 180);

    init();

    expect(document.querySelector('.cp-overlay')).toBeNull();
    expect(window.CookiePlugin.getConsent()).toEqual(consent);
  });

  it('pushes cp_consent_update and closes banner on accept all', () => {
    init();

    document.querySelector('.cp-btn-accept')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const updateEvent = window.dataLayer.find(
      (entry) => typeof entry === 'object' && entry?.event === 'cp_consent_update'
    );

    expect(updateEvent).toMatchObject({
      event: 'cp_consent_update',
      consent: {
        functional: true,
        analytics: true,
        marketing: true,
      },
    });
    expect(document.querySelector('.cp-overlay')).toBeNull();
    expect(window.CookiePlugin.getConsent()?.source).toBe('accept_all');
  });

  it('opens preferences view from customize button', () => {
    init();

    document.querySelector('.cp-btn-middle')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.querySelector('[data-panel="details"]')?.classList.contains('cp-hidden')).toBe(false);
    expect(document.querySelector('[data-panel="consent"]')?.classList.contains('cp-hidden')).toBe(true);
  });

  it('shows privacy policy link when privacyPolicyUrl is configured', () => {
    init({ privacyPolicyUrl: 'https://example.com/privacy' });

    const privacyLink = document.querySelector('.cp-link');
    expect(privacyLink).not.toBeNull();
    expect(privacyLink?.getAttribute('href')).toBe('https://example.com/privacy');
  });

  it('hides privacy policy link when privacyPolicyUrl is not configured', () => {
    init();

    expect(document.querySelector('.cp-link')).toBeNull();
  });
});
