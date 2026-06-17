import { describe, it, expect } from 'vitest';
import { lookupItem, PATTERNS } from '../src/scan/patterns.js';

describe('scan patterns lookup', () => {
  it('classifies _ga as analytics', () => {
    expect(lookupItem({ type: 'cookie', name: '_ga' })).toEqual({
      category: 'analytics',
      provider: 'Google Analytics',
      retention: '2 jaar',
    });
  });

  it('classifies _fbp as marketing', () => {
    expect(lookupItem({ type: 'cookie', name: '_fbp' })).toEqual({
      category: 'marketing',
      provider: 'Meta',
      retention: '3 maanden',
    });
  });

  it('classifies GTM script URL as analytics', () => {
    expect(
      lookupItem({
        type: 'script',
        name: 'gtm.js',
        src: 'https://www.googletagmanager.com/gtm.js?id=GTM-123',
      })
    ).toEqual({
      category: 'analytics',
      provider: 'Google Tag Manager',
      retention: '',
    });
  });

  it('returns unclassified for unknown items', () => {
    expect(lookupItem({ type: 'cookie', name: 'mijn_eigen_cookie' })).toEqual({
      category: 'unclassified',
      provider: '',
      retention: '',
    });
  });

  it('contains known patterns', () => {
    expect(PATTERNS.length).toBeGreaterThan(10);
  });
});
