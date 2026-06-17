/** @typedef {'functional' | 'analytics' | 'marketing' | 'unclassified'} InventoryCategory */

/**
 * @typedef {Object} InventoryItem
 * @property {string} type
 * @property {string} name
 * @property {string} [src]
 * @property {InventoryCategory} category
 * @property {string} [provider]
 * @property {string} [description]
 * @property {string} [retention]
 */

/**
 * @typedef {Object} CookieInventory
 * @property {number} version
 * @property {string} [scannedAt]
 * @property {string} [pageUrl]
 * @property {InventoryItem[]} items
 */

export const INVENTORY_CATEGORIES = ['functional', 'analytics', 'marketing', 'unclassified'];

/**
 * @param {unknown} data
 * @returns {CookieInventory | null}
 */
export function parseInventory(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = /** @type {Record<string, unknown>} */ (data);
  if (!Array.isArray(record.items)) {
    return null;
  }

  /** @type {InventoryItem[]} */
  const items = [];

  for (const entry of record.items) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const item = /** @type {Record<string, unknown>} */ (entry);
    if (typeof item.name !== 'string' || typeof item.type !== 'string') {
      continue;
    }

    const category = typeof item.category === 'string' ? item.category : 'unclassified';

    items.push({
      type: item.type,
      name: item.name,
      ...(typeof item.src === 'string' ? { src: item.src } : {}),
      category: /** @type {InventoryCategory} */ (category),
      ...(typeof item.provider === 'string' ? { provider: item.provider } : {}),
      ...(typeof item.description === 'string' ? { description: item.description } : {}),
      ...(typeof item.retention === 'string' ? { retention: item.retention } : {}),
    });
  }

  return {
    version: typeof record.version === 'number' ? record.version : 1,
    ...(typeof record.scannedAt === 'string' ? { scannedAt: record.scannedAt } : {}),
    ...(typeof record.pageUrl === 'string' ? { pageUrl: record.pageUrl } : {}),
    items,
  };
}

/**
 * @param {string} url
 * @returns {Promise<CookieInventory | null>}
 */
export async function loadInventory(url) {
  if (!url || typeof fetch === 'undefined') {
    return null;
  }

  try {
    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return parseInventory(data);
  } catch {
    return null;
  }
}

/**
 * @param {{ cookieInventory?: unknown; cookieInventoryUrl?: string }} config
 * @returns {Promise<CookieInventory | null>}
 */
export async function resolveInventory(config) {
  if (config.cookieInventory) {
    return parseInventory(config.cookieInventory);
  }

  if (config.cookieInventoryUrl) {
    return loadInventory(config.cookieInventoryUrl);
  }

  return null;
}

/**
 * @param {CookieInventory | null} inventory
 * @param {boolean} [showUnclassified]
 * @returns {Record<InventoryCategory, InventoryItem[]>}
 */
export function groupByCategory(inventory, showUnclassified = true) {
  /** @type {Record<InventoryCategory, InventoryItem[]>} */
  const grouped = {
    functional: [],
    analytics: [],
    marketing: [],
    unclassified: [],
  };

  if (!inventory) {
    return grouped;
  }

  for (const item of inventory.items) {
    const category = INVENTORY_CATEGORIES.includes(item.category)
      ? item.category
      : 'unclassified';

    if (category === 'unclassified' && !showUnclassified) {
      continue;
    }

    grouped[/** @type {InventoryCategory} */ (category)].push(item);
  }

  return grouped;
}

/**
 * @param {Record<InventoryCategory, InventoryItem[]>} grouped
 * @param {InventoryCategory} category
 * @returns {number}
 */
export function countByCategory(grouped, category) {
  return grouped[category]?.length || 0;
}
