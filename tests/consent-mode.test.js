import { describe, it, expect, beforeEach } from 'vitest';
import {
  mapConsentToGoogle,
  createConsentRecord,
  DEFAULT_CONSENT_MODE,
} from '../src/consent-mode.js';

describe('consent-mode', () => {
  describe('mapConsentToGoogle', () => {
    it('maps all denied except functional and security', () => {
      expect(
        mapConsentToGoogle({
          functional: true,
          analytics: false,
          marketing: false,
        })
      ).toEqual({
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
        security_storage: 'granted',
      });
    });

    it('maps all granted when analytics and marketing are accepted', () => {
      expect(
        mapConsentToGoogle({
          functional: true,
          analytics: true,
          marketing: true,
        })
      ).toEqual({
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'granted',
        security_storage: 'granted',
      });
    });

    it('maps analytics only when marketing is rejected', () => {
      const result = mapConsentToGoogle({
        functional: true,
        analytics: true,
        marketing: false,
      });

      expect(result.analytics_storage).toBe('granted');
      expect(result.ad_storage).toBe('denied');
      expect(result.personalization_storage).toBe('denied');
    });
  });

  describe('createConsentRecord', () => {
    it('always sets functional to true', () => {
      const record = createConsentRecord(false, false, 'reject_all', 1);
      expect(record.functional).toBe(true);
      expect(record.analytics).toBe(false);
      expect(record.marketing).toBe(false);
      expect(record.source).toBe('reject_all');
      expect(record.version).toBe(1);
      expect(record.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('DEFAULT_CONSENT_MODE', () => {
    it('denies analytics and marketing by default', () => {
      expect(DEFAULT_CONSENT_MODE.analytics_storage).toBe('denied');
      expect(DEFAULT_CONSENT_MODE.ad_storage).toBe('denied');
      expect(DEFAULT_CONSENT_MODE.functionality_storage).toBe('granted');
      expect(DEFAULT_CONSENT_MODE.security_storage).toBe('granted');
    });
  });
});
