import { collectItemsWithMonitor } from './collect.js';
import { lookupItem } from './patterns.js';

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
 * @returns {InventoryItem[]}
 */
export function buildInventoryItems(rawItems) {
  return rawItems.map((item) => {
    const lookup = lookupItem(item);
    return {
      type: item.type,
      name: item.name,
      ...(item.src ? { src: item.src } : {}),
      category: lookup.category,
      provider: lookup.provider,
      description: '',
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
  const rawItems = await collectItemsWithMonitor(monitorSeconds);
  const items = buildInventoryItems(rawItems);
  const inventory = createInventory(items, pageUrl);

  if (typeof document !== 'undefined') {
    downloadInventory(inventory, filename);
  }

  return inventory;
}
