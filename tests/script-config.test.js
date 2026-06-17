import { describe, it, expect } from 'vitest';
import { readScriptConfig } from '../src/script-config.js';

describe('readScriptConfig', () => {
  it('returns privacyPolicyUrl from data-privacy-policy-url attribute', () => {
    const script = document.createElement('script');
    script.setAttribute('data-privacy-policy-url', 'https://example.com/privacy');

    expect(readScriptConfig(script)).toEqual({
      privacyPolicyUrl: 'https://example.com/privacy',
    });
  });

  it('returns cookieInventoryUrl from data-cookie-inventory attribute', () => {
    const script = document.createElement('script');
    script.setAttribute('data-cookie-inventory', '/cookie-inventory.json');

    expect(readScriptConfig(script)).toEqual({
      cookieInventoryUrl: '/cookie-inventory.json',
    });
  });

  it('returns empty config when no privacy policy attribute is set', () => {
    const script = document.createElement('script');

    expect(readScriptConfig(script)).toEqual({});
  });

  it('returns empty config when script element is missing', () => {
    expect(readScriptConfig(null)).toEqual({});
  });
});
