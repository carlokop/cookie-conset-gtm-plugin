import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  applyConsentUpdateAndWait,
  getGtmConsentValue,
  isConsentModeApplied,
  pushConsentUpdateCommand,
  waitForConsentApplied,
} from '../src/consent-api.js';
import { mapConsentToGoogle, createConsentRecord } from '../src/consent-mode.js';

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

describe('consent-api', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.dataLayer = [];
    delete window.google_tag_data;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window.google_tag_data;
  });

  it('pushes consent update as a dataLayer array command', () => {
    const consentMode = mapConsentToGoogle(createConsentRecord(true, false, 'custom', 1));

    pushConsentUpdateCommand(consentMode);

    expect(window.dataLayer).toContainEqual(['consent', 'update', consentMode]);
  });

  it('reads consent values via getConsentState and entries.initial', () => {
    window.google_tag_data = {
      ics: {
        getConsentState(type) {
          if (type === 'analytics_storage') {
            return 1;
          }
          if (type === 'ad_storage') {
            return 0;
          }
          return undefined;
        },
        entries: {
          analytics_storage: { initial: 'denied', update: 'granted' },
          ad_storage: { initial: 'denied' },
        },
      },
    };

    expect(getGtmConsentValue('analytics_storage')).toBe('granted');
    expect(getGtmConsentValue('ad_storage')).toBe('denied');
    expect(getGtmConsentValue('missing')).toBeNull();
  });

  it('waits for GTM consent API before invoking callback', () => {
    const consent = createConsentRecord(true, false, 'custom', 1);
    const consentMode = mapConsentToGoogle(consent);
    const onApplied = vi.fn();

    waitForConsentApplied(consentMode, onApplied);
    vi.advanceTimersByTime(100);
    expect(onApplied).not.toHaveBeenCalled();

    mockGtmConsentState(consentMode);
    vi.advanceTimersByTime(10);
    expect(onApplied).toHaveBeenCalledWith(consentMode);
  });

  it('fires callback from gtag consent update when API confirms', () => {
    const consent = createConsentRecord(true, true, 'accept_all', 1);
    const consentMode = mapConsentToGoogle(consent);
    const onApplied = vi.fn();
    const gtag = vi.fn((...args) => {
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        setTimeout(() => {
          mockGtmConsentState(consentMode);
          callback();
        }, 25);
      }
    });

    applyConsentUpdateAndWait(gtag, consentMode, onApplied);

    vi.advanceTimersByTime(24);
    expect(onApplied).not.toHaveBeenCalled();

    vi.advanceTimersByTime(10);
    expect(onApplied).toHaveBeenCalledTimes(1);
    expect(onApplied).toHaveBeenCalledWith(consentMode);
  });

  it('detects when all consent types match expected state', () => {
    const consentMode = mapConsentToGoogle(
      createConsentRecord(true, false, 'custom', 1)
    );

    expect(isConsentModeApplied(consentMode)).toBe(false);

    mockGtmConsentState(consentMode);
    expect(isConsentModeApplied(consentMode)).toBe(true);
  });
});
