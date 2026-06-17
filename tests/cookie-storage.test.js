import { describe, it, expect, beforeEach } from 'vitest';
import {
  readConsentCookie,
  writeConsentCookie,
  isConsentValid,
  getCookieValue,
  setCookieValue,
} from '../src/cookie-storage.js';
import { createConsentRecord } from '../src/consent-mode.js';

describe('cookie-storage', () => {
  beforeEach(() => {
    document.cookie = 'cp_cookie_consent=; Max-Age=0; Path=/';
  });

  it('writes and reads consent cookie', () => {
    const consent = createConsentRecord(true, false, 'custom', 1);
    writeConsentCookie('cp_cookie_consent', consent, 180);

    const stored = readConsentCookie('cp_cookie_consent');
    expect(stored).toEqual(consent);
  });

  it('returns null for missing cookie', () => {
    expect(readConsentCookie('cp_cookie_consent')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    setCookieValue('cp_cookie_consent', 'not-json', 180);
    expect(readConsentCookie('cp_cookie_consent')).toBeNull();
  });

  it('returns null for incomplete consent object', () => {
    setCookieValue('cp_cookie_consent', JSON.stringify({ version: 1 }), 180);
    expect(readConsentCookie('cp_cookie_consent')).toBeNull();
  });

  it('validates consent version', () => {
    const consent = createConsentRecord(false, false, 'reject_all', 1);
    expect(isConsentValid(consent, 1)).toBe(true);
    expect(isConsentValid(consent, 2)).toBe(false);
    expect(isConsentValid(null, 1)).toBe(false);
  });

  it('reads cookie by encoded name', () => {
    setCookieValue('cp_cookie_consent', '{"test":true}', 180);
    expect(getCookieValue('cp_cookie_consent')).toBe('{"test":true}');
  });
});
