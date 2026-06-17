import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { init } from '../src/plugin.js';
import { createConsentRecord, mapConsentToGoogle } from '../src/consent-mode.js';
import { writeConsentCookie } from '../src/cookie-storage.js';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('plugin init flow', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.cookie = 'cp_cookie_consent=; Max-Age=0; Path=/';
    window.CookiePluginLoaded = false;
    window.dataLayer = [];
    delete window.google_tag_data;
    window.CookiePluginConfig = {
      consentVersion: 1,
      cookieName: 'cp_cookie_consent',
    };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window.google_tag_data;
  });

  it('shows banner when no consent cookie exists', async () => {
    init();
    await flushPromises();

    expect(document.querySelector('.cp-overlay')).not.toBeNull();
    expect(document.querySelector('[data-panel="consent"]')).not.toBeNull();
  });

  it('does not show banner when valid consent cookie exists', async () => {
    const consent = createConsentRecord(true, true, 'accept_all', 1);
    writeConsentCookie('cp_cookie_consent', consent, 180);

    init();
    await flushPromises();

    expect(document.querySelector('.cp-overlay')).toBeNull();
    expect(window.CookiePlugin.getConsent()).toEqual(consent);
  });

  it('pushes cp_consent_update on page load when valid consent cookie exists', async () => {
    vi.useFakeTimers();
    const consent = createConsentRecord(true, false, 'custom', 1);
    const consentMode = mapConsentToGoogle(consent);
    writeConsentCookie('cp_cookie_consent', consent, 180);

    init();

    expect(
      window.dataLayer.find(
        (entry) => typeof entry === 'object' && entry?.event === 'cp_consent_update'
      )
    ).toBeUndefined();

    window.google_tag_data = {
      ics: {
        getConsentState(type) {
          return consentMode[type] === 'granted' ? 1 : 0;
        },
        entries: Object.fromEntries(
          Object.entries(consentMode).map(([key, value]) => [key, { update: value }])
        ),
      },
    };
    vi.advanceTimersByTime(20);

    const updateEvent = window.dataLayer.find(
      (entry) => typeof entry === 'object' && entry?.event === 'cp_consent_update'
    );

    expect(updateEvent).toMatchObject({
      event: 'cp_consent_update',
      consent: {
        functional: true,
        analytics: true,
        marketing: false,
      },
    });
    vi.useRealTimers();
  });

  it('pushes cp_consent_update and closes banner on accept all', async () => {
    vi.useFakeTimers();
    init();
    await vi.runAllTimersAsync();

    document.querySelector('.cp-btn-accept')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(
      window.dataLayer.find(
        (entry) => typeof entry === 'object' && entry?.event === 'cp_consent_update'
      )
    ).toBeUndefined();

    const consent = window.CookiePlugin.getConsent();
    const consentMode = mapConsentToGoogle(consent);
    window.google_tag_data = {
      ics: {
        getConsentState(type) {
          return consentMode[type] === 'granted' ? 1 : 0;
        },
        entries: Object.fromEntries(
          Object.entries(consentMode).map(([key, value]) => [key, { update: value }])
        ),
      },
    };
    vi.advanceTimersByTime(20);

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
    vi.useRealTimers();
  });

  it('opens preferences view from customize button', async () => {
    init();
    await flushPromises();

    document.querySelector('.cp-btn-middle')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.querySelector('[data-panel="details"]')?.classList.contains('cp-hidden')).toBe(false);
    expect(document.querySelector('[data-panel="consent"]')?.classList.contains('cp-hidden')).toBe(true);
  });

  it('shows privacy policy link when privacyPolicyUrl is configured', async () => {
    init({ privacyPolicyUrl: 'https://example.com/privacy' });
    await flushPromises();

    const privacyLink = document.querySelector('.cp-link');
    expect(privacyLink).not.toBeNull();
    expect(privacyLink?.getAttribute('href')).toBe('https://example.com/privacy');
  });

  it('hides privacy policy link when privacyPolicyUrl is not configured', async () => {
    init();
    await flushPromises();

    expect(document.querySelector('.cp-link')).toBeNull();
  });

  it('shows inventory items in details tab when inventory is loaded', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: 1,
          items: [
            {
              type: 'cookie',
              name: '_ga',
              category: 'analytics',
              provider: 'Google Analytics',
              description: 'Statistieken',
            },
          ],
        }),
      })
    );

    init({ cookieInventoryUrl: '/cookie-inventory.json' });
    await flushPromises();

    document.querySelector('.cp-btn-middle')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.querySelector('.cp-category-badge')?.textContent).toBe('1');
    expect(document.querySelector('.cp-inventory-item-name')?.textContent).toBe('_ga');
  });

  it('shows inventory items from inline cookieInventory config', async () => {
    init({
      cookieInventory: {
        version: 1,
        items: [
          {
            type: 'cookie',
            name: '_fbp',
            category: 'marketing',
            provider: 'Meta',
            description: 'Advertenties',
          },
        ],
      },
    });
    await flushPromises();

    document.querySelector('.cp-btn-middle')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.querySelector('.cp-inventory-item-name')?.textContent).toBe('_fbp');
  });

  it('shows retention in details tab when present in inventory', async () => {
    init({
      cookieInventory: {
        version: 1,
        items: [
          {
            type: 'cookie',
            name: '_ga',
            category: 'analytics',
            provider: 'Google Analytics',
            retention: '2 jaar',
          },
        ],
      },
    });
    await flushPromises();

    document.querySelector('.cp-btn-middle')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.querySelector('.cp-inventory-item-meta')?.textContent).toContain('Bewaartermijn: 2 jaar');
  });
});
