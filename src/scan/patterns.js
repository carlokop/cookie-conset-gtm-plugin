/** @typedef {'cookie' | 'script' | 'storage' | 'iframe' | 'resource'} ScanItemType */
/** @typedef {'functional' | 'analytics' | 'marketing' | 'unclassified'} InventoryCategory */

/**
 * @typedef {Object} ScanPattern
 * @property {RegExp | string} match
 * @property {ScanItemType | ScanItemType[] | '*'} [type]
 * @property {InventoryCategory} category
 * @property {string} provider
 */

/** @type {ScanPattern[]} */
export const PATTERNS = [
  // Functional cookies
  { match: /^cp_cookie_consent$/, type: 'cookie', category: 'functional', provider: 'Cookie Plugin' },
  { match: /^PHPSESSID$/, type: 'cookie', category: 'functional', provider: 'PHP' },
  { match: /^wordpress_/, type: 'cookie', category: 'functional', provider: 'WordPress' },
  { match: /^wp-/, type: 'cookie', category: 'functional', provider: 'WordPress' },
  { match: /^csrf/, type: 'cookie', category: 'functional', provider: '' },
  { match: /^__cf/, type: 'cookie', category: 'functional', provider: 'Cloudflare' },
  { match: /^cf_/, type: 'cookie', category: 'functional', provider: 'Cloudflare' },
  { match: /^JSESSIONID$/, type: 'cookie', category: 'functional', provider: 'Java' },
  { match: /^ASP\.NET_SessionId$/, type: 'cookie', category: 'functional', provider: 'ASP.NET' },

  // Analytics cookies
  { match: /^_ga$/, type: 'cookie', category: 'analytics', provider: 'Google Analytics' },
  { match: /^_ga_/, type: 'cookie', category: 'analytics', provider: 'Google Analytics' },
  { match: /^_gid$/, type: 'cookie', category: 'analytics', provider: 'Google Analytics' },
  { match: /^_gat/, type: 'cookie', category: 'analytics', provider: 'Google Analytics' },
  { match: /^_gcl_au$/, type: 'cookie', category: 'analytics', provider: 'Google Ads' },
  { match: /^AMP_/, type: 'cookie', category: 'analytics', provider: 'Google AMP' },
  { match: /^_hj/, type: 'cookie', category: 'analytics', provider: 'Hotjar' },
  { match: /^_clck$/, type: 'cookie', category: 'analytics', provider: 'Microsoft Clarity' },
  { match: /^_clsk$/, type: 'cookie', category: 'analytics', provider: 'Microsoft Clarity' },
  { match: /^CLID$/, type: 'cookie', category: 'analytics', provider: 'Microsoft Clarity' },
  { match: /^MUID$/, type: 'cookie', category: 'analytics', provider: 'Microsoft' },
  { match: /^hubspotutk$/, type: 'cookie', category: 'analytics', provider: 'HubSpot' },
  { match: /^__hstc$/, type: 'cookie', category: 'analytics', provider: 'HubSpot' },
  { match: /^__hssc$/, type: 'cookie', category: 'analytics', provider: 'HubSpot' },
  { match: /^__hssrc$/, type: 'cookie', category: 'analytics', provider: 'HubSpot' },
  { match: /^pk_id/, type: 'cookie', category: 'analytics', provider: 'Matomo' },
  { match: /^pk_ses/, type: 'cookie', category: 'analytics', provider: 'Matomo' },

  // Marketing cookies
  { match: /^_fbp$/, type: 'cookie', category: 'marketing', provider: 'Meta' },
  { match: /^_fbc$/, type: 'cookie', category: 'marketing', provider: 'Meta' },
  { match: /^fr$/, type: 'cookie', category: 'marketing', provider: 'Meta' },
  { match: /^IDE$/, type: 'cookie', category: 'marketing', provider: 'Google DoubleClick' },
  { match: /^test_cookie$/, type: 'cookie', category: 'marketing', provider: 'Google DoubleClick' },
  { match: /^li_/, type: 'cookie', category: 'marketing', provider: 'LinkedIn' },
  { match: /^bcookie$/, type: 'cookie', category: 'marketing', provider: 'LinkedIn' },
  { match: /^bscookie$/, type: 'cookie', category: 'marketing', provider: 'LinkedIn' },
  { match: /^_gcl_/, type: 'cookie', category: 'marketing', provider: 'Google Ads' },
  { match: /^NID$/, type: 'cookie', category: 'marketing', provider: 'Google' },
  { match: /^DV$/, type: 'cookie', category: 'marketing', provider: 'Google' },
  { match: /^__Secure-3PSID/, type: 'cookie', category: 'marketing', provider: 'Google' },
  { match: /^__Secure-3PAPISID/, type: 'cookie', category: 'marketing', provider: 'Google' },

  // Analytics scripts / resources
  { match: /googletagmanager\.com/, type: ['script', 'resource', 'iframe'], category: 'analytics', provider: 'Google Tag Manager' },
  { match: /google-analytics\.com/, type: ['script', 'resource'], category: 'analytics', provider: 'Google Analytics' },
  { match: /analytics\.google\.com/, type: ['script', 'resource'], category: 'analytics', provider: 'Google Analytics' },
  { match: /hotjar\.com/, type: ['script', 'resource', 'iframe'], category: 'analytics', provider: 'Hotjar' },
  { match: /clarity\.ms/, type: ['script', 'resource'], category: 'analytics', provider: 'Microsoft Clarity' },
  { match: /matomo/, type: ['script', 'resource'], category: 'analytics', provider: 'Matomo' },
  { match: /piwik/, type: ['script', 'resource'], category: 'analytics', provider: 'Matomo' },
  { match: /hubspot\.com/, type: ['script', 'resource'], category: 'analytics', provider: 'HubSpot' },

  // Marketing scripts / resources
  { match: /connect\.facebook\.net/, type: ['script', 'resource'], category: 'marketing', provider: 'Meta' },
  { match: /facebook\.com\/tr/, type: ['script', 'resource', 'iframe'], category: 'marketing', provider: 'Meta' },
  { match: /doubleclick\.net/, type: ['script', 'resource', 'iframe'], category: 'marketing', provider: 'Google DoubleClick' },
  { match: /googleadservices\.com/, type: ['script', 'resource'], category: 'marketing', provider: 'Google Ads' },
  { match: /googlesyndication\.com/, type: ['script', 'resource'], category: 'marketing', provider: 'Google Ads' },
  { match: /snap\.licdn\.com/, type: ['script', 'resource'], category: 'marketing', provider: 'LinkedIn' },
  { match: /linkedin\.com\/px/, type: ['script', 'resource'], category: 'marketing', provider: 'LinkedIn' },
  { match: /tiktok\.com\/i18n\/pixel/, type: ['script', 'resource'], category: 'marketing', provider: 'TikTok' },
  { match: /analytics\.tiktok\.com/, type: ['script', 'resource'], category: 'marketing', provider: 'TikTok' },
];

const UNCLASSIFIED = { category: /** @type {InventoryCategory} */ ('unclassified'), provider: '' };

/**
 * @param {string} value
 * @param {RegExp | string} match
 */
function matchesPattern(value, match) {
  if (match instanceof RegExp) {
    return match.test(value);
  }
  return value === match || value.startsWith(match);
}

/**
 * @param {ScanItemType} itemType
 * @param {ScanPattern['type']} patternType
 */
function typeMatches(itemType, patternType) {
  if (!patternType || patternType === '*') {
    return true;
  }
  if (Array.isArray(patternType)) {
    return patternType.includes(itemType);
  }
  return patternType === itemType;
}

/**
 * @param {{ type: ScanItemType; name: string; src?: string }} item
 * @returns {{ category: InventoryCategory; provider: string }}
 */
export function lookupItem(item) {
  const lookupValues = [item.name];
  if (item.src) {
    lookupValues.push(item.src);
  }

  for (const pattern of PATTERNS) {
    if (!typeMatches(item.type, pattern.type)) {
      continue;
    }

    for (const value of lookupValues) {
      if (matchesPattern(value, pattern.match)) {
        return { category: pattern.category, provider: pattern.provider };
      }
    }
  }

  return UNCLASSIFIED;
}
