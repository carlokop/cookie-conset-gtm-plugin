/**
 * Cookie Store API returns expires in milliseconds (DOMTimeStamp).
 * @param {number | null | undefined} expires
 * @returns {number | null}
 */
export function normalizeExpiryToSeconds(expires) {
  if (expires == null || expires === 0 || expires === -1) {
    return null;
  }

  if (expires > 1e11) {
    return expires / 1000;
  }

  return expires;
}

/**
 * @param {number | null | undefined} expires
 * @param {Date} [now]
 * @returns {string}
 */
export function formatRetentionFromExpiry(expires, now = new Date()) {
  const expiresUnixSeconds = normalizeExpiryToSeconds(expires);

  if (expiresUnixSeconds == null) {
    return 'Sessie';
  }

  const nowSeconds = now.getTime() / 1000;
  const days = Math.round((expiresUnixSeconds - nowSeconds) / 86400);

  if (days <= 0) {
    return 'Verlopen';
  }
  if (days > 4000) {
    return '';
  }
  if (days === 1) {
    return '1 dag';
  }
  if (days < 30) {
    return `${days} dagen`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    return months === 1 ? '1 maand' : `${months} maanden`;
  }

  const years = Math.round(days / 365);
  return years === 1 ? '1 jaar' : `${years} jaar`;
}

/**
 * @param {import('./collect.js').RawScanItem} item
 * @returns {string}
 */
export function getDefaultStorageRetention(item) {
  if (item.name.startsWith('session:')) {
    return 'Sessie';
  }
  return 'Permanent (browser)';
}

/**
 * @param {string} itemName
 * @param {Map<string, number | null>} cookieExpiries
 * @returns {number | null | undefined}
 */
export function findCookieExpiry(itemName, cookieExpiries) {
  if (cookieExpiries.has(itemName)) {
    return cookieExpiries.get(itemName);
  }

  const decodedName = decodeURIComponent(itemName);

  for (const [cookieName, expiry] of cookieExpiries.entries()) {
    if (cookieName === decodedName || decodeURIComponent(cookieName) === decodedName) {
      return expiry;
    }
  }

  if (itemName.includes('*')) {
    const prefix = itemName.split('*')[0];
    for (const [cookieName, expiry] of cookieExpiries.entries()) {
      const decoded = decodeURIComponent(cookieName);
      if (decoded.startsWith(prefix)) {
        return expiry;
      }
    }
  }

  return undefined;
}

/**
 * @param {import('./collect.js').RawScanItem} item
 * @param {Map<string, number | null>} cookieExpiries
 * @param {string} [patternRetention]
 * @returns {string}
 */
export function resolveRetention(item, cookieExpiries, patternRetention = '') {
  if (item.type === 'storage') {
    return getDefaultStorageRetention(item);
  }

  if (item.type === 'cookie') {
    const expiry = findCookieExpiry(item.name, cookieExpiries);
    if (expiry !== undefined) {
      const measured = formatRetentionFromExpiry(expiry);
      if (measured) {
        return measured;
      }
    }
  }

  return patternRetention;
}
