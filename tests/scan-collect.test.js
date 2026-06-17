import { describe, it, expect, beforeEach } from 'vitest';
import { collectItems, parseCookieNames, getResourceName } from '../src/scan/collect.js';

describe('scan collect', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.cookie = 'test_cookie=1';
  });

  it('parses cookie names from document.cookie string', () => {
    expect(parseCookieNames('a=1; b=2; c=3')).toEqual(['a', 'b', 'c']);
  });

  it('collects cookies from document', () => {
    const items = collectItems(document);
    const cookieNames = items.filter((item) => item.type === 'cookie').map((item) => item.name);

    expect(cookieNames).toContain('test_cookie');
  });

  it('collects external scripts', () => {
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-123';
    document.body.appendChild(script);

    const items = collectItems(document);
    const scripts = items.filter((item) => item.type === 'script');

    expect(scripts.some((item) => item.src?.includes('googletagmanager.com'))).toBe(true);
  });

  it('extracts resource name from URL', () => {
    expect(getResourceName('https://example.com/assets/app.js?v=1')).toBe('app.js');
  });
});
