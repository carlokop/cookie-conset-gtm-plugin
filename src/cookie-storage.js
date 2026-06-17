/**
 * @typedef {import('./consent-mode.js').ConsentRecord} ConsentRecord
 */

/**
 * @param {string} name
 * @returns {string | null}
 */
export function getCookieValue(name) {
  if (typeof document === 'undefined') {
    return null;
  }

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(encodedName)) {
      return decodeURIComponent(trimmed.slice(encodedName.length));
    }
  }

  return null;
}

/**
 * @param {string} name
 * @param {string} value
 * @param {number} maxAgeDays
 */
export function setCookieValue(name, value, maxAgeDays) {
  if (typeof document === 'undefined') {
    return;
  }

  const maxAgeSeconds = Math.floor(maxAgeDays * 24 * 60 * 60);
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
}

/**
 * @param {string} cookieName
 * @returns {ConsentRecord | null}
 */
export function readConsentCookie(cookieName) {
  const raw = getCookieValue(cookieName);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.version !== 'number' ||
      typeof parsed.functional !== 'boolean' ||
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.marketing !== 'boolean'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * @param {string} cookieName
 * @param {ConsentRecord} consent
 * @param {number} maxAgeDays
 */
export function writeConsentCookie(cookieName, consent, maxAgeDays) {
  setCookieValue(cookieName, JSON.stringify(consent), maxAgeDays);
}

/**
 * @param {ConsentRecord | null} consent
 * @param {number} expectedVersion
 * @returns {boolean}
 */
export function isConsentValid(consent, expectedVersion) {
  return Boolean(consent && consent.version === expectedVersion);
}
