import { describe, it, expect } from 'vitest';
import { parseInventory, groupByCategory } from '../src/inventory.js';

describe('inventory', () => {
  const sample = {
    version: 1,
    scannedAt: '2026-06-17T10:00:00.000Z',
    pageUrl: 'https://example.com/',
    items: [
      { type: 'cookie', name: '_ga', category: 'analytics', provider: 'Google Analytics' },
      { type: 'cookie', name: 'cp_cookie_consent', category: 'functional', provider: 'Cookie Plugin' },
      { type: 'cookie', name: 'unknown', category: 'unclassified' },
    ],
  };

  it('parses valid inventory JSON', () => {
    const inventory = parseInventory(sample);
    expect(inventory?.items).toHaveLength(3);
    expect(inventory?.items[0].name).toBe('_ga');
  });

  it('returns null for invalid inventory JSON', () => {
    expect(parseInventory(null)).toBeNull();
    expect(parseInventory({ version: 1 })).toBeNull();
  });

  it('groups items by category', () => {
    const grouped = groupByCategory(parseInventory(sample), true);

    expect(grouped.functional).toHaveLength(1);
    expect(grouped.analytics).toHaveLength(1);
    expect(grouped.unclassified).toHaveLength(1);
  });

  it('can hide unclassified items', () => {
    const grouped = groupByCategory(parseInventory(sample), false);
    expect(grouped.unclassified).toHaveLength(0);
  });
});
