import { collectItemsWithMonitor } from './collect.js';
import { collectCookieExpiries } from './cookie-expiries.js';
import { filterTrackerItems } from './filter.js';
import { lookupItem } from './patterns.js';
import { resolveRetention } from './retention.js';
import { sanitizeCollectedItems, sanitizePageUrl } from './sanitize.js';

/**
 * @typedef {import('./patterns.js').InventoryCategory} InventoryCategory
 */

/**
 * @typedef {Object} InventoryItem
 * @property {string} type
 * @property {string} name
 * @property {string} [src]
 * @property {InventoryCategory} category
 * @property {string} provider
 * @property {string} description
 * @property {string} retention
 */

/**
 * @typedef {Object} CookieInventory
 * @property {number} version
 * @property {string} scannedAt
 * @property {string} pageUrl
 * @property {InventoryItem[]} items
 */

/**
 * @param {import('./collect.js').RawScanItem[]} rawItems
 * @param {Map<string, number | null>} [cookieExpiries]
 * @returns {InventoryItem[]}
 */
export function buildInventoryItems(rawItems, cookieExpiries = new Map()) {
  return rawItems.map((item) => {
    const lookup = lookupItem(item);
    const retention = resolveRetention(item, cookieExpiries, lookup.retention);
    return {
      type: item.type,
      name: item.name,
      ...(item.src ? { src: item.src } : {}),
      category: lookup.category,
      provider: lookup.provider,
      description: '',
      ...(retention ? { retention } : {}),
    };
  });
}

/**
 * @param {InventoryItem[]} items
 * @param {string} pageUrl
 * @returns {CookieInventory}
 */
export function createInventory(items, pageUrl) {
  return {
    version: 1,
    scannedAt: new Date().toISOString(),
    pageUrl,
    items,
  };
}

/**
 * @param {CookieInventory} inventory
 * @param {string} [filename]
 */
export function downloadInventory(inventory, filename = 'cookie-inventory.json') {
  const blob = new Blob([JSON.stringify(inventory, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * @param {{ monitorSeconds?: number; filename?: string }} [options]
 * @returns {Promise<CookieInventory>}
 */
export async function run(options = {}) {
  const monitorSeconds = options.monitorSeconds ?? 5;
  const filename = options.filename ?? 'cookie-inventory.json';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const cookieExpiries = await collectCookieExpiries();
  const sanitized = sanitizeCollectedItems(await collectItemsWithMonitor(monitorSeconds));
  const rawItems = filterTrackerItems(sanitized, pageUrl);
  const items = buildInventoryItems(rawItems, cookieExpiries);
  const inventory = createInventory(items, sanitizePageUrl(pageUrl));

  if (typeof document !== 'undefined') {
    downloadInventory(inventory, filename);
  }

  return inventory;
}
