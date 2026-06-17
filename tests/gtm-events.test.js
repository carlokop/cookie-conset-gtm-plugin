import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mergeConfig } from '../src/config.js';
import { mapConsentToGoogle, createConsentRecord } from '../src/consent-mode.js';
import { applyConsentUpdateAndWait } from '../src/consent-api.js';

/**
 * @param {import('../src/consent-mode.js').GoogleConsentMode} consentMode
 */
function mockGtmConsentState(consentMode) {
  window.google_tag_data = {
    ics: {
      getConsentState(type) {
        const value = consentMode[type];
        if (value === 'granted') {
          return 1;
        }
        if (value === 'denied') {
          return 0;
        }
        return undefined;
      },
      entries: Object.fromEntries(
        Object.entries(consentMode).map(([key, value]) => [key, { update: value }])
      ),
    },
  };
}

describe('gtm dataLayer integration', () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let gtag;

  beforeEach(() => {
    vi.useFakeTimers();
    window.dataLayer = [];
    gtag = vi.fn((...args) => {
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        setTimeout(callback, 20);
      }
    });
    delete window.google_tag_data;
  });

  it('pushes cp_consent_update only after consent API confirms', () => {
    const consent = createConsentRecord(true, false, 'custom', 1);
    const consentMode = mapConsentToGoogle(consent);

    applyConsentUpdateAndWait(gtag, consentMode, (appliedMode) => {
      window.dataLayer.push({
        event: 'cp_consent_update',
        consent: {
          functional: consent.functional,
          analytics: consent.analytics,
          marketing: consent.marketing,
        },
        consentMode: appliedMode,
      });
    });

    expect(window.dataLayer).toContainEqual(['consent', 'update', consentMode]);
    expect(
      window.dataLayer.find(
        (entry) => typeof entry === 'object' && entry?.event === 'cp_consent_update'
      )
    ).toBeUndefined();

    mockGtmConsentState(consentMode);
    vi.advanceTimersByTime(20);

    expect(window.dataLayer).toContainEqual({
      event: 'cp_consent_update',
      consent: {
        functional: true,
        analytics: true,
        marketing: false,
      },
      consentMode,
    });
  });

  it('mergeConfig preserves nested category texts', () => {
    const config = mergeConfig({
      texts: {
        title: 'Custom title',
        categories: {
          analytics: {
            title: 'Custom analytics',
          },
        },
      },
    });

    expect(config.texts.title).toBe('Custom title');
    expect(config.texts.categories.analytics.title).toBe('Custom analytics');
    expect(config.texts.categories.functional.title).toBe('Noodzakelijk');
  });
});
