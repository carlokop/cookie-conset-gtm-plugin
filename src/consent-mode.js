/** @typedef {'granted' | 'denied'} ConsentState */

/**
 * @typedef {Object} ConsentRecord
 * @property {number} version
 * @property {boolean} functional
 * @property {boolean} analytics
 * @property {boolean} marketing
 * @property {string} updatedAt
 * @property {'accept_all' | 'reject_all' | 'custom'} [source]
 */

/**
 * @typedef {Object} GoogleConsentMode
 * @property {ConsentState} ad_storage
 * @property {ConsentState} ad_user_data
 * @property {ConsentState} ad_personalization
 * @property {ConsentState} analytics_storage
 * @property {ConsentState} functionality_storage
 * @property {ConsentState} personalization_storage
 * @property {ConsentState} security_storage
 */

export const DEFAULT_CONSENT_MODE = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
};

/**
 * @param {boolean} granted
 * @returns {ConsentState}
 */
function toConsentState(granted) {
  return granted ? 'granted' : 'denied';
}

/**
 * @param {Pick<ConsentRecord, 'functional' | 'analytics' | 'marketing'>} consent
 * @returns {GoogleConsentMode}
 */
export function mapConsentToGoogle(consent) {
  return {
    ad_storage: toConsentState(consent.marketing),
    ad_user_data: toConsentState(consent.marketing),
    ad_personalization: toConsentState(consent.marketing),
    analytics_storage: toConsentState(consent.analytics),
    functionality_storage: toConsentState(consent.functional),
    personalization_storage: toConsentState(consent.marketing),
    security_storage: 'granted',
  };
}

/**
 * @param {Function} gtag
 */
export function applyDefaultConsent(gtag) {
  gtag('consent', 'default', { ...DEFAULT_CONSENT_MODE });
}

/**
 * @param {Function} gtag
 * @param {ConsentRecord} consent
 * @returns {GoogleConsentMode}
 */
export function applyConsentUpdate(gtag, consent) {
  const consentMode = mapConsentToGoogle(consent);
  gtag('consent', 'update', consentMode);
  return consentMode;
}

/**
 * @param {boolean} analytics
 * @param {boolean} marketing
 * @param {'accept_all' | 'reject_all' | 'custom'} source
 * @param {number} version
 * @returns {ConsentRecord}
 */
export function createConsentRecord(analytics, marketing, source, version) {
  return {
    version,
    functional: true,
    analytics: Boolean(analytics),
    marketing: Boolean(marketing),
    updatedAt: new Date().toISOString(),
    source,
  };
}
