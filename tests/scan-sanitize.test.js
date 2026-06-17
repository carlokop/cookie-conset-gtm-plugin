import { describe, it, expect } from 'vitest';
import {
  sanitizeUrl,
  sanitizeName,
  sanitizeCollectedItems,
  sanitizePageUrl,
  shouldExcludeItem,
} from '../src/scan/sanitize.js';

describe('scan sanitize', () => {
  it('removes query strings from URLs', () => {
    expect(
      sanitizeUrl(
        'https://googleads.g.doubleclick.net/pagead/viewthroughconversion/997520393/?random=1781691774390&auid=209545372'
      )
    ).toBe('https://googleads.g.doubleclick.net/pagead/viewthroughconversion/997520393');
  });

  it('replaces UUIDs in names with wildcard', () => {
    expect(
      sanitizeName('crisp-client/session/f77e62f1-f194-4dec-b4d2-2a84d1475803')
    ).toBe('crisp-client/session/*');
  });

  it('excludes localhost scanner artifacts', () => {
    expect(
      shouldExcludeItem({
        type: 'script',
        name: 'cookie-scanner.min.js',
        src: 'http://localhost:3000/dist/cookie-scanner.min.js',
      })
    ).toBe(true);
  });

  it('deduplicates items after sanitization', () => {
    const items = sanitizeCollectedItems([
      {
        type: 'script',
        name: '997520393',
        src: 'https://googleads.g.doubleclick.net/pagead/viewthroughconversion/997520393/?random=1',
      },
      {
        type: 'resource',
        name: '997520393',
        src: 'https://googleads.g.doubleclick.net/pagead/viewthroughconversion/997520393/?random=2',
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0].src).toBe(
      'https://googleads.g.doubleclick.net/pagead/viewthroughconversion/997520393'
    );
  });

  it('sanitizes page URL without query string', () => {
    expect(sanitizePageUrl('https://www.tjingo.nl/?utm_source=test')).toBe('https://www.tjingo.nl');
  });
});
