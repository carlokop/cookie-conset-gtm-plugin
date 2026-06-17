/** @typedef {'cookie' | 'script' | 'storage' | 'iframe' | 'resource'} ScanItemType */
/** @typedef {'functional' | 'analytics' | 'marketing' | 'unclassified'} InventoryCategory */

/**
 * @typedef {Object} ScanPattern
 * @property {RegExp | string} match
 * @property {ScanItemType | ScanItemType[] | '*'} [type]
 * @property {InventoryCategory} category
 * @property {string} provider
 * @property {string} [retention]
 */

/** @type {ScanPattern[]} */
export const PATTERNS = [
  // Functional cookies
  { match: /^cp_cookie_consent$/, type: 'cookie', category: 'functional', provider: 'Cookie Plugin', retention: '180 dagen' },
  { match: /^cookiefirst-consent$/, type: ['cookie', 'storage'], category: 'functional', provider: 'CookieFirst', retention: '1 jaar' },
  { match: /^cookiefirst-id$/, type: 'storage', category: 'functional', provider: 'CookieFirst', retention: '1 jaar' },
  { match: /cookiefirst\.com/, type: ['script', 'resource'], category: 'functional', provider: 'CookieFirst' },
  { match: /crisp-client\/trigger/, type: 'storage', category: 'marketing', provider: 'Crisp' },
  { match: /^crisp-client/, type: ['cookie', 'storage'], category: 'functional', provider: 'Crisp', retention: '6 maanden' },
  { match: /crisp\.chat/, type: ['script', 'resource'], category: 'functional', provider: 'Crisp' },
  { match: /^session:is_eu$/, type: 'storage', category: 'functional', provider: 'Crisp' },
  { match: /trustpilot\.com/, type: ['script', 'resource'], category: 'functional', provider: 'Trustpilot' },
  { match: /tjingo\.nl\/api\//, type: 'resource', category: 'functional', provider: 'Tjingo' },
  { match: /tjingo\.nl\/assets\//, type: ['script', 'resource'], category: 'functional', provider: 'Tjingo' },
  { match: /^index-.*\.js$/, type: ['script', 'resource'], category: 'functional', provider: 'Tjingo' },
  { match: /^lastExternalReferrer/, type: 'storage', category: 'marketing', provider: 'Meta' },
  { match: /mouseflow\.com/, type: ['script', 'resource'], category: 'analytics', provider: 'Mouseflow' },
  { match: /adsmurai\.com/, type: ['script', 'resource'], category: 'marketing', provider: 'Adsmurai' },
  { match: /google\.com\/ccm\/collect/, type: 'resource', category: 'analytics', provider: 'Google Analytics' },
  { match: /^PHPSESSID$/, type: 'cookie', category: 'functional', provider: 'PHP' },
  { match: /^wordpress_/, type: 'cookie', category: 'functional', provider: 'WordPress' },
  { match: /^wp-/, type: 'cookie', category: 'functional', provider: 'WordPress' },
  { match: /^csrf/, type: 'cookie', category: 'functional', provider: '' },
  { match: /^__cf/, type: 'cookie', category: 'functional', provider: 'Cloudflare' },
  { match: /^cf_/, type: 'cookie', category: 'functional', provider: 'Cloudflare' },
  { match: /^JSESSIONID$/, type: 'cookie', category: 'functional', provider: 'Java' },
  { match: /^ASP\.NET_SessionId$/, type: 'cookie', category: 'functional', provider: 'ASP.NET' },

  // Analytics cookies
  { match: /^_ga$/, type: 'cookie', category: 'analytics', provider: 'Google Analytics', retention: '2 jaar' },
  { match: /^_ga_/, type: 'cookie', category: 'analytics', provider: 'Google Analytics', retention: '2 jaar' },
  { match: /^_gid$/, type: 'cookie', category: 'analytics', provider: 'Google Analytics', retention: '1 dag' },
  { match: /^_gat/, type: 'cookie', category: 'analytics', provider: 'Google Analytics', retention: '1 minuut' },
  { match: /^_gcl_au$/, type: 'cookie', category: 'marketing', provider: 'Google Ads', retention: '3 maanden' },
  { match: /^_gcl_ls$/, type: 'storage', category: 'marketing', provider: 'Google Ads' },
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
  { match: /^_pin_unauth$/, type: 'cookie', category: 'marketing', provider: 'Pinterest', retention: '1 jaar' },
  { match: /^_uetsid/, type: ['cookie', 'storage'], category: 'marketing', provider: 'Microsoft Advertising', retention: '1 dag' },
  { match: /^_uetvid/, type: ['cookie', 'storage'], category: 'marketing', provider: 'Microsoft Advertising', retention: '13 maanden' },

  // Marketing cookies
  { match: /^_fbp$/, type: 'cookie', category: 'marketing', provider: 'Meta', retention: '3 maanden' },
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
  { match: /pinimg\.com/, type: ['script', 'resource'], category: 'marketing', provider: 'Pinterest' },
  { match: /ct\.pinterest\.com/, type: ['script', 'resource'], category: 'marketing', provider: 'Pinterest' },
  { match: /bat\.bing\.com/, type: ['script', 'resource'], category: 'marketing', provider: 'Microsoft Advertising' },
  { match: /google\.com\/rmkt/, type: 'resource', category: 'marketing', provider: 'Google Ads' },
  { match: /gtag\/js\?id=AW-/, type: ['script', 'resource'], category: 'marketing', provider: 'Google Ads' },
  { match: /localhost.*cookie-scanner/, type: ['script', 'resource'], category: 'unclassified', provider: '' },
];

const UNCLASSIFIED = {
  category: /** @type {InventoryCategory} */ ('unclassified'),
  provider: '',
  retention: '',
};

/**
 * @returns {{ category: InventoryCategory; provider: string; retention: string }}
 */
function patternResult(pattern) {
  return {
    category: pattern.category,
    provider: pattern.provider,
    retention: pattern.retention || '',
  };
}

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
 * @returns {{ category: InventoryCategory; provider: string; retention: string }}
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
        return patternResult(pattern);
      }
    }
  }

  return UNCLASSIFIED;
}
