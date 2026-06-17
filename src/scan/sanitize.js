/**
 * @typedef {import('./collect.js').RawScanItem} RawScanItem
 */

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

const LONG_TOKEN_PATTERN = /[A-Za-z0-9+/=_-]{32,}/g;

/**
 * @param {string} url
 * @returns {string}
 */
export function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    if (isDevHost(parsed.hostname)) {
      return '';
    }
    const path = parsed.pathname.replace(UUID_PATTERN, '*');
    return `${parsed.origin}${path}`.replace(/\/+$/, '') || parsed.origin;
  } catch {
    return '';
  }
}

/**
 * @param {string} hostname
 */
function isDevHost(hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local')
  );
}

/**
 * @param {string} name
 */
export function sanitizeName(name) {
  let sanitized = decodeURIComponent(name);
  sanitized = sanitized.replace(UUID_PATTERN, '*');
  sanitized = sanitized.replace(LONG_TOKEN_PATTERN, '*');
  sanitized = sanitized.replace(/\*+/g, '*');
  return sanitized;
}

/**
 * @param {RawScanItem} item
 */
export function shouldExcludeItem(item) {
  if (item.src && isDevHost(safeHostname(item.src))) {
    return true;
  }

  if (/cookie-scanner/i.test(item.name) || /cookie-scanner/i.test(item.src || '')) {
    return true;
  }

  return false;
}

/**
 * @param {string} url
 */
function safeHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * @param {RawScanItem} item
 * @returns {RawScanItem}
 */
export function sanitizeItem(item) {
  const name = sanitizeName(item.name);
  const src = item.src ? sanitizeUrl(item.src) : undefined;

  return {
    type: item.type,
    name,
    ...(src ? { src } : {}),
  };
}

/**
 * @param {RawScanItem['type']} type
 */
function typePriority(type) {
  const order = { cookie: 0, storage: 1, script: 2, iframe: 3, resource: 4 };
  return order[type] ?? 5;
}

/**
 * @param {RawScanItem[]} items
 * @returns {RawScanItem[]}
 */
export function sanitizeCollectedItems(items) {
  /** @type {Map<string, RawScanItem>} */
  const deduped = new Map();

  for (const item of items) {
    if (shouldExcludeItem(item)) {
      continue;
    }

    const sanitized = sanitizeItem(item);
    if (!sanitized.name && !sanitized.src) {
      continue;
    }

    const key = sanitized.src || `${sanitized.type}:${sanitized.name}`;
    const existing = deduped.get(key);
    if (!existing || typePriority(sanitized.type) < typePriority(existing.type)) {
      deduped.set(key, sanitized);
    }
  }

  return Array.from(deduped.values());
}

/**
 * @param {string} pageUrl
 */
export function sanitizePageUrl(pageUrl) {
  return sanitizeUrl(pageUrl) || pageUrl.split('?')[0].split('#')[0];
}
