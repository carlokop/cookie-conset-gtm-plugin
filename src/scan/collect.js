/**
 * @typedef {import('./patterns.js').ScanItemType} ScanItemType
 */

/**
 * @typedef {Object} RawScanItem
 * @property {ScanItemType} type
 * @property {string} name
 * @property {string} [src]
 */

/**
 * @param {string} cookieString
 * @returns {string[]}
 */
export function parseCookieNames(cookieString) {
  if (!cookieString) {
    return [];
  }

  return cookieString
    .split(';')
    .map((part) => part.trim().split('=')[0])
    .filter(Boolean);
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {string[]}
 */
export function readStorageKeys(storage) {
  if (!storage) {
    return [];
  }

  const keys = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * @param {string} url
 * @returns {string}
 */
export function getResourceName(url) {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.href : 'https://example.com');
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || parsed.hostname;
  } catch {
    return url;
  }
}

/**
 * @param {Document} [doc]
 * @returns {RawScanItem[]}
 */
export function collectItems(doc = document) {
  /** @type {RawScanItem[]} */
  const items = [];
  /** @type {Set<string>} */
  const seen = new Set();

  /**
   * @param {RawScanItem} item
   */
  function addItem(item) {
    const key = `${item.type}:${item.name}:${item.src || ''}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    items.push(item);
  }

  for (const name of parseCookieNames(doc.cookie)) {
    addItem({ type: 'cookie', name });
  }

  for (const name of readStorageKeys(doc.defaultView?.localStorage)) {
    addItem({ type: 'storage', name });
  }

  for (const name of readStorageKeys(doc.defaultView?.sessionStorage)) {
    addItem({ type: 'storage', name: `session:${name}` });
  }

  doc.querySelectorAll('script[src]').forEach((node) => {
    const src = node.getAttribute('src');
    if (!src) {
      return;
    }
    addItem({ type: 'script', name: getResourceName(src), src });
  });

  doc.querySelectorAll('iframe[src]').forEach((node) => {
    const src = node.getAttribute('src');
    if (!src) {
      return;
    }
    addItem({ type: 'iframe', name: getResourceName(src), src });
  });

  if (typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function') {
    performance.getEntriesByType('resource').forEach((entry) => {
      if (!entry.name || !/^https?:/.test(entry.name)) {
        return;
      }

      const initiator = /** @type {{ initiatorType?: string }} */ (entry).initiatorType;
      if (initiator !== 'script' && initiator !== 'iframe' && initiator !== 'fetch' && initiator !== 'xmlhttprequest') {
        return;
      }

      addItem({
        type: 'resource',
        name: getResourceName(entry.name),
        src: entry.name,
      });
    });
  }

  return items;
}

/**
 * @param {number} [monitorSeconds]
 * @param {Document} [doc]
 * @returns {Promise<RawScanItem[]>}
 */
export async function collectItemsWithMonitor(monitorSeconds = 0, doc = document) {
  const initial = collectItems(doc);

  if (!monitorSeconds || monitorSeconds <= 0) {
    return initial;
  }

  /** @type {Set<string>} */
  const seen = new Set(initial.map((item) => `${item.type}:${item.name}:${item.src || ''}`));
  /** @type {RawScanItem[]} */
  const collected = [...initial];

  const intervalMs = 500;
  const iterations = Math.ceil((monitorSeconds * 1000) / intervalMs);

  for (let index = 0; index < iterations; index += 1) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    for (const item of collectItems(doc)) {
      const key = `${item.type}:${item.name}:${item.src || ''}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      collected.push(item);
    }
  }

  return collected;
}
