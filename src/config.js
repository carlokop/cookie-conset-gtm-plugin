export const DEFAULT_CONFIG = {
  consentVersion: 1,
  cookieName: 'cp_cookie_consent',
  cookieMaxAgeDays: 180,
  consentWaitForUpdateMs: 500,
  privacyPolicyUrl: '',
  cookieInventoryUrl: '',
  showUnclassified: true,
  texts: {
    title: 'Deze website gebruikt cookies',
    description:
      'We gebruiken cookies om content en advertenties te personaliseren, social media-functies aan te bieden en ons verkeer te analyseren. We delen ook informatie over uw gebruik van onze site met onze social media-, advertentie- en analysepartners.',
    acceptAll: 'Alles toestaan',
    rejectAll: 'Weigeren',
    customize: 'Aanpassen',
    savePreferences: 'Selectie toestaan',
    back: 'Terug',
    privacyPolicy: 'Privacybeleid',
    aboutTitle: 'Over cookies',
    aboutDescription:
      'Cookies zijn kleine tekstbestanden die op uw apparaat worden opgeslagen wanneer u een website bezoekt. Ze helpen de site te laten werken, onthouden voorkeuren en geven inzicht in hoe de website wordt gebruikt.',
    lastUpdated: 'Cookieverklaring voor het laatst bijgewerkt op {date}',
    tabs: {
      consent: 'Toestemming',
      details: 'Details',
      about: 'Over',
    },
    categories: {
      functional: {
        title: 'Noodzakelijk',
        description:
          'Noodzakelijke cookies helpen een website bruikbaarder te maken door basisfuncties mogelijk te maken, zoals paginanavigatie en toegang tot beveiligde delen van de website. De website kan zonder deze cookies niet goed functioneren.',
      },
      analytics: {
        title: 'Statistieken',
        description:
          'Statistische cookies helpen website-eigenaren te begrijpen hoe bezoekers met websites omgaan door anoniem informatie te verzamelen en te rapporteren.',
      },
      marketing: {
        title: 'Marketing',
        description:
          'Marketingcookies worden gebruikt om bezoekers te volgen wanneer ze verschillende websites bezoeken. Het doel is advertenties weer te geven die relevant en aantrekkelijk zijn voor de individuele gebruiker.',
      },
      unclassified: {
        title: 'Niet geclassificeerd',
        description:
          'Deze cookies of scripts zijn nog niet ingedeeld in een categorie.',
      },
    },
    inventory: {
      providerLabel: 'Aanbieder',
      retentionLabel: 'Bewaartermijn',
      noItems: 'Geen items gevonden in de inventaris.',
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
