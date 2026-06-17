export const DEFAULT_CONFIG = {
  consentVersion: 1,
  cookieName: 'cp_cookie_consent',
  cookieMaxAgeDays: 180,
  consentWaitForUpdateMs: 500,
  privacyPolicyUrl: '',
  cookieInventoryUrl: '',
  showUnclassified: true,
  texts: {
    title: 'This website uses cookies',
    description:
      'We use cookies to personalize content and ads, provide social media features, and analyze our traffic. We also share information about your use of our site with our social media, advertising, and analytics partners.',
    acceptAll: 'Allow all',
    rejectAll: 'Deny',
    customize: 'Customize',
    savePreferences: 'Allow selection',
    back: 'Back',
    privacyPolicy: 'Privacy policy',
    aboutTitle: 'About cookies',
    aboutDescription:
      'Cookies are small text files stored on your device when you visit a website. They help the site work, remember preferences, and provide insight into how the website is used.',
    lastUpdated: 'Cookie declaration last updated on {date}',
    tabs: {
      consent: 'Consent',
      details: 'Details',
      about: 'About',
    },
    categories: {
      functional: {
        title: 'Necessary',
        description:
          'Necessary cookies help make a website usable by enabling basic functions such as page navigation and access to secure areas. The website cannot function properly without these cookies.',
      },
      analytics: {
        title: 'Statistics',
        description:
          'Statistical cookies help website owners understand how visitors interact with websites by collecting and reporting information anonymously.',
      },
      marketing: {
        title: 'Marketing',
        description:
          'Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user.',
      },
      unclassified: {
        title: 'Unclassified',
        description: 'These cookies or scripts have not yet been classified into a category.',
      },
    },
    inventory: {
      providerLabel: 'Provider',
      retentionLabel: 'Retention',
      noItems: 'No items found in the inventory.',
    },
  },
};

/**
 * @param {Partial<typeof DEFAULT_CONFIG>} userConfig
 * @returns {typeof DEFAULT_CONFIG}
 */
export function mergeConfig(userConfig = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    texts: {
      ...DEFAULT_CONFIG.texts,
      ...(userConfig.texts || {}),
      tabs: {
        ...DEFAULT_CONFIG.texts.tabs,
        ...(userConfig.texts?.tabs || {}),
      },
      categories: {
        ...DEFAULT_CONFIG.texts.categories,
        ...(userConfig.texts?.categories || {}),
        functional: {
          ...DEFAULT_CONFIG.texts.categories.functional,
          ...(userConfig.texts?.categories?.functional || {}),
        },
        analytics: {
          ...DEFAULT_CONFIG.texts.categories.analytics,
          ...(userConfig.texts?.categories?.analytics || {}),
        },
        marketing: {
          ...DEFAULT_CONFIG.texts.categories.marketing,
          ...(userConfig.texts?.categories?.marketing || {}),
        },
        unclassified: {
          ...DEFAULT_CONFIG.texts.categories.unclassified,
          ...(userConfig.texts?.categories?.unclassified || {}),
        },
      },
      inventory: {
        ...DEFAULT_CONFIG.texts.inventory,
        ...(userConfig.texts?.inventory || {}),
      },
    },
  };
}
