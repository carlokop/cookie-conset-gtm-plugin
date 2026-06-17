import { describe, it, expect } from 'vitest';
import {
  formatRetentionFromExpiry,
  findCookieExpiry,
  resolveRetention,
  getDefaultStorageRetention,
} from '../src/scan/retention.js';

describe('scan retention', () => {
  it('formats session cookies', () => {
    expect(formatRetentionFromExpiry(null)).toBe('Sessie');
    expect(formatRetentionFromExpiry(0)).toBe('Sessie');
    expect(formatRetentionFromExpiry(-1)).toBe('Sessie');
  });

  it('handles Cookie Store API expiry in milliseconds', () => {
    const now = new Date('2026-06-17T12:00:00.000Z');
    const expiryMs = now.getTime() + 730 * 86400 * 1000;
    expect(formatRetentionFromExpiry(expiryMs, now)).toBe('2 jaar');
  });

  it('formats remaining days from expiry timestamp', () => {
    const now = new Date('2026-06-17T12:00:00.000Z');
    const expiryMonths = now.getTime() / 1000 + 200 * 86400;
    const expiryYears = now.getTime() / 1000 + 730 * 86400;
    expect(formatRetentionFromExpiry(expiryMonths, now)).toBe('7 maanden');
    expect(formatRetentionFromExpiry(expiryYears, now)).toBe('2 jaar');
  });

  it('finds expiry for wildcard cookie names', () => {
    const expiries = new Map([
      ['crisp-client/session/abc-123', nowPlusDays(180)],
    ]);

    expect(findCookieExpiry('crisp-client/session/*', expiries)).toBe(nowPlusDays(180));
  });

  it('uses measured cookie expiry when available', () => {
    const expiries = new Map([['_ga', nowPlusDays(730)]]);
    const retention = resolveRetention(
      { type: 'cookie', name: '_ga' },
      expiries,
      '2 jaar'
    );

    expect(retention).toBe('2 jaar');
  });

  it('falls back when measured expiry is implausible', () => {
    const retention = resolveRetention(
      { type: 'cookie', name: 'cookiefirst-consent' },
      new Map([['cookiefirst-consent', 1e10]]),
      '1 jaar'
    );

    expect(retention).toBe('1 jaar');
  });

  it('uses pattern fallback when expiry is unavailable', () => {
    const retention = resolveRetention(
      { type: 'cookie', name: '_fbp' },
      new Map(),
      '3 maanden'
    );

    expect(retention).toBe('3 maanden');
  });

  it('labels storage retention', () => {
    expect(getDefaultStorageRetention({ type: 'storage', name: 'session:foo' })).toBe('Sessie');
    expect(getDefaultStorageRetention({ type: 'storage', name: '_gcl_ls' })).toBe(
      'Permanent (browser)'
    );
  });
});

function nowPlusDays(days) {
  return Date.now() / 1000 + days * 86400;
}
