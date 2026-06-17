import { describe, it, expect } from 'vitest';
import { filterTrackerItems } from '../src/scan/filter.js';

describe('filterTrackerItems', () => {
  const pageUrl = 'https://www.tjingo.nl/';

  it('keeps cookies but removes storage', () => {
    const items = filterTrackerItems(
      [
        { type: 'cookie', name: '_ga' },
        { type: 'storage', name: 'cookiefirst-id' },
        { type: 'storage', name: 'crisp-client/trigger/*/visit/count' },
      ],
      pageUrl
    );

    expect(items).toEqual([{ type: 'cookie', name: '_ga' }]);
  });

  it('removes first-party and relative scripts', () => {
    const items = filterTrackerItems(
      [
        {
          type: 'script',
          name: 'index-BD_iirHW.js',
          src: 'https://www.tjingo.nl/assets/index-BD_iirHW.js',
        },
        { type: 'script', name: 'index-BD_iirHW.js' },
      ],
      pageUrl
    );

    expect(items).toHaveLength(0);
  });

  it('removes consent, chat and review scripts', () => {
    const items = filterTrackerItems(
      [
        {
          type: 'script',
          name: 'consent.js',
          src: 'https://consent.cookiefirst.com/sites/tjingo.nl-*/consent.js',
        },
        {
          type: 'script',
          name: 'l.js',
          src: 'https://client.crisp.chat/l.js',
        },
        {
          type: 'script',
          name: 'tp.widget.bootstrap.min.js',
          src: 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js',
        },
      ],
      pageUrl
    );

    expect(items).toHaveLength(0);
  });

  it('removes first-party API and consent resources', () => {
    const items = filterTrackerItems(
      [
        {
          type: 'resource',
          name: 'top10',
          src: 'https://www.tjingo.nl/api/search/top10',
        },
        {
          type: 'resource',
          name: 'C1aMrv.js',
          src: 'https://consent.cookiefirst.com/banner/v3.0.22/static-main-no-autoblock/C1aMrv.js',
        },
      ],
      pageUrl
    );

    expect(items).toHaveLength(0);
  });

  it('keeps third-party tracking scripts and resources', () => {
    const items = filterTrackerItems(
      [
        {
          type: 'script',
          name: 'gtm.js',
          src: 'https://www.googletagmanager.com/gtm.js',
        },
        {
          type: 'script',
          name: 'fbevents.js',
          src: 'https://connect.facebook.net/en_US/fbevents.js',
        },
        {
          type: 'resource',
          name: '997520393',
          src: 'https://googleads.g.doubleclick.net/pagead/viewthroughconversion/997520393',
        },
        {
          type: 'resource',
          name: 'collect',
          src: 'https://www.google.com/ccm/collect',
        },
      ],
      pageUrl
    );

    expect(items).toHaveLength(4);
  });
});
