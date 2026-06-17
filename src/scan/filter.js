/**
 * @typedef {import('./collect.js').RawScanItem} RawScanItem
 */

/** Third-party domains used for analytics/marketing tracking. */
const TRACKING_DOMAIN_PATTERNS = [
  /googletagmanager\.com/i,
  /google-analytics\.com/i,
  /analytics\.google\.com/i,
  /doubleclick\.net/i,
  /googleadservices\.com/i,
  /googlesyndication\.com/i,
  /google\.com\/(ccm|rmkt)/i,
  /connect\.facebook\.net/i,
  /ct\.pinterest\.com/i,
  /pinimg\.com/i,
  /bat\.bing\.com/i,
  /mouseflow\.com/i,
  /adsmurai\.com/i,
  /analytics\.tiktok\.com/i,
  /hotjar\.com/i,
  /clarity\.ms/i,
  /linkedin\.com\/px/i,
  /snap\.licdn\.com/i,
];

/** Consent, chat, reviews and other non-tracking services. */
const NON_TRACKER_DOMAIN_PATTERNS = [
  /cookiefirst\.com/i,
  /crisp\.chat/i,
  /trustpilot\.com/i,
  /cookiebot\.com/i,
  /usercentrics\.eu/i,
];

/**
 * @param {string} [url]
 * @param {string} [pageOrigin]
 */
function isSameOrigin(url, pageOrigin) {
  if (!url || !pageOrigin) {
    return false;
  }

  try {
    const resolved = url.startsWith('http')
      ? url
      : `${pageOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
    return new URL(resolved).origin === pageOrigin;
  } catch {
    return false;
  }
}

/**
 * @param {RawScanItem} item
 */
function itemValue(item) {
  return `${item.src || ''} ${item.name}`;
}

/**
 * @param {RawScanItem} item
 */
function isNonTrackerDomain(item) {
  return NON_TRACKER_DOMAIN_PATTERNS.some((pattern) => pattern.test(itemValue(item)));
}

/**
 * @param {RawScanItem} item
 */
function isTrackingDomain(item) {
  return TRACKING_DOMAIN_PATTERNS.some((pattern) => pattern.test(itemValue(item)));
}

/**
 * @param {RawScanItem} item
 */
function hasExternalUrl(item) {
  return Boolean(item.src && /^https?:\/\//i.test(item.src));
}

/**
 * Exports cookies and real third-party trackers.
 * Excludes storage, consent/chat/review scripts, and same-site code.
 *
 * @param {RawScanItem[]} items
 * @param {string} [pageUrl]
 * @returns {RawScanItem[]}
 */
export function filterTrackerItems(items, pageUrl = '') {
  let pageOrigin = '';

  try {
    pageOrigin = pageUrl ? new URL(pageUrl).origin : '';
  } catch {
    pageOrigin = '';
  }

  if (!pageOrigin && typeof window !== 'undefined') {
    pageOrigin = window.location.origin;
  }

  return items.filter((item) => shouldIncludeInInventory(item, pageOrigin));
}

/**
 * @param {RawScanItem} item
 * @param {string} pageOrigin
 */
function shouldIncludeInInventory(item, pageOrigin) {
  if (item.type === 'cookie') {
    return true;
  }

  if (item.type === 'storage') {
    return false;
  }

  if (item.type === 'script' || item.type === 'resource' || item.type === 'iframe') {
    if (isNonTrackerDomain(item)) {
      return false;
    }
    if (!hasExternalUrl(item)) {
      return false;
    }
    if (isSameOrigin(item.src, pageOrigin)) {
      return false;
    }
    return isTrackingDomain(item);
  }

  return false;
}
