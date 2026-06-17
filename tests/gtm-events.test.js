import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mergeConfig } from '../src/config.js';
import { applyConsentUpdate } from '../src/consent-mode.js';
import { createConsentRecord } from '../src/consent-mode.js';

describe('gtm dataLayer integration', () => {
  /** @type {Array<unknown>} */
  let dataLayer;
  /** @type {ReturnType<typeof vi.fn>} */
  let gtag;

  beforeEach(() => {
    dataLayer = [];
    gtag = vi.fn((...args) => {
      dataLayer.push(args);
    });
  });

  it('pushes cp_consent_update after consent update', () => {
    const consent = createConsentRecord(true, false, 'custom', 1);
    const consentMode = applyConsentUpdate(gtag, consent);

    dataLayer.push({
      event: 'cp_consent_update',
      consent: {
        functional: consent.functional,
        analytics: consent.analytics,
        marketing: consent.marketing,
      },
      consentMode,
    });

    expect(gtag).toHaveBeenCalledWith('consent', 'update', consentMode);
    expect(dataLayer).toContainEqual({
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
