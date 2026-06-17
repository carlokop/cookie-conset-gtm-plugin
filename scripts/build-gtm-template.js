import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const outPath = resolve(import.meta.dirname, '../dist/gtm-consent-template.tpl');
const defaultCookieName = 'cp_cookie_consent';
const thumbnail = readFileSync(
  resolve(import.meta.dirname, 'thumbnail-uri.txt'),
  'utf8'
).trim();

const consentTypes = [
  'ad_storage',
  'ad_user_data',
  'ad_personalization',
  'analytics_storage',
  'functionality_storage',
  'personalization_storage',
  'security_storage',
  'wait_for_update',
];

const dataLayerKeys = ['event', 'consent', 'consentMode'];

/**
 * @param {string} type
 */
function consentPermissionItem(type) {
  return `              {
                "type": 3,
                "mapKey": [
                  {"type": 1, "string": "consentType"},
                  {"type": 1, "string": "read"},
                  {"type": 1, "string": "write"}
                ],
                "mapValue": [
                  {"type": 1, "string": "${type}"},
                  {"type": 8, "boolean": true},
                  {"type": 8, "boolean": true}
                ]
              }`;
}

/**
 * @param {string} key
 * @param {boolean} read
 * @param {boolean} write
 * @param {boolean} execute
 */
function globalPermissionItem(key, read, write, execute) {
  return `              {
                "type": 3,
                "mapKey": [
                  {"type": 1, "string": "key"},
                  {"type": 1, "string": "read"},
                  {"type": 1, "string": "write"},
                  {"type": 1, "string": "execute"}
                ],
                "mapValue": [
                  {"type": 1, "string": "${key}"},
                  {"type": 8, "boolean": ${read}},
                  {"type": 8, "boolean": ${write}},
                  {"type": 8, "boolean": ${execute}}
                ]
              }`;
}

const webPermissions = `[
  {
    "instance": {
      "key": {
        "publicId": "access_consent",
        "versionId": "1"
      },
      "param": [
        {
          "key": "consentTypes",
          "value": {
            "type": 2,
            "listItem": [
${consentTypes.map(consentPermissionItem).join(',\n')}
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "get_cookies",
        "versionId": "1"
      },
      "param": [
        {
          "key": "cookieAccess",
          "value": {
            "type": 1,
            "string": "specific"
          }
        },
        {
          "key": "cookieNames",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "${defaultCookieName}"
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "access_globals",
        "versionId": "1"
      },
      "param": [
        {
          "key": "keys",
          "value": {
            "type": 2,
            "listItem": [
${[
  globalPermissionItem('dataLayer', true, true, false),
  globalPermissionItem('CookiePluginGtmConsentActive', true, true, false),
  globalPermissionItem('CookiePlugin_addGtmConsentListener', false, false, true),
].join(',\n')}
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "write_data_layer",
        "versionId": "1"
      },
      "param": [
        {
          "key": "keyPatterns",
          "value": {
            "type": 2,
            "listItem": [
${dataLayerKeys
  .map((key) => `              {"type": 1, "string": "${key}"}`)
  .join(',\n')}
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  }
]`;

const template = `___TERMS_OF_SERVICE___

By creating or modifying this file you agree to Google Tag Manager's Community
Template Gallery Developer Terms of Service available at
https://developers.google.com/tag-manager/gallery-tos (or such other URL as
Google may provide), as modified from time to time.

___INFO___

{
  "type": "TAG",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "Cookie Plugin Consent API",
  "brand": {
    "id": "brand_cookieplugin",
    "displayName": "Cookie Plugin",
    "thumbnail": "${thumbnail}"
  },
  "description": "Sets Google Consent Mode via the GTM Consent API. Use with Cookie Plugin bridge and UI tags.",
  "categories": [
    "CONSENT_MANAGEMENT",
    "UTILITY"
  ],
  "containerContexts": [
    "WEB"
  ]
}

___TEMPLATE_PARAMETERS___

[
  {
    "type": "TEXT",
    "name": "cookieName",
    "displayName": "Consent cookie name",
    "simpleValueType": true,
    "defaultValue": "${defaultCookieName}",
    "help": "Name of the cookie that stores the visitor consent record. If you change this value, also update the cookie name on the Permissions tab."
  },
  {
    "type": "TEXT",
    "name": "consentVersion",
    "displayName": "Consent version",
    "simpleValueType": true,
    "defaultValue": "1",
    "help": "Consent record version. Saved cookies with a different version are ignored."
  },
  {
    "type": "TEXT",
    "name": "waitForUpdateMs",
    "displayName": "Wait for update (ms)",
    "simpleValueType": true,
    "defaultValue": "500",
    "help": "How long Google tags wait for an update command before firing."
  }
]

___SANDBOXED_JS_FOR_WEB_TEMPLATE___

const setDefaultConsentState = require('setDefaultConsentState');
const updateConsentState = require('updateConsentState');
const getCookieValues = require('getCookieValues');
const callInWindow = require('callInWindow');
const setInWindow = require('setInWindow');
const addEventCallback = require('addEventCallback');
const queryPermission = require('queryPermission');
const createQueue = require('createQueue');
const makeNumber = require('makeNumber');
const JSON = require('JSON');

const dataLayerPush = createQueue('dataLayer');

const cookieName = data.cookieName || '${defaultCookieName}';
const consentVersion = makeNumber(data.consentVersion) || 1;
const waitForUpdateMs = makeNumber(data.waitForUpdateMs) || 500;

const isBoolean = function(value) {
  return value === true || value === false;
};

const mapToConsentMode = function(consent) {
  return {
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    functionality_storage: consent.functional ? 'granted' : 'denied',
    personalization_storage: consent.marketing ? 'granted' : 'denied',
    security_storage: 'granted'
  };
};

const isValidConsent = function(consent) {
  if (!consent) {
    return false;
  }
  if (consent.version !== consentVersion) {
    return false;
  }
  if (!isBoolean(consent.functional)) {
    return false;
  }
  if (!isBoolean(consent.analytics)) {
    return false;
  }
  if (!isBoolean(consent.marketing)) {
    return false;
  }
  return true;
};

const pushConsentEvent = function(consent, consentMode) {
  dataLayerPush({
    event: 'cp_consent_update',
    consent: {
      functional: consent.functional,
      analytics: consent.analytics,
      marketing: consent.marketing
    },
    consentMode: consentMode
  });
};

const applyConsent = function(consent) {
  const consentMode = mapToConsentMode(consent);
  updateConsentState(consentMode);
  pushConsentEvent(consent, consentMode);
};

const readSavedConsent = function() {
  if (!queryPermission('get_cookies', cookieName)) {
    return null;
  }

  const values = getCookieValues(cookieName);
  if (!values || values.length === 0) {
    return null;
  }

  const raw = values[0];
  if (!raw) {
    return null;
  }

  const consent = JSON.parse(raw);
  return isValidConsent(consent) ? consent : null;
};

setDefaultConsentState({
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: waitForUpdateMs
});

setInWindow('CookiePluginGtmConsentActive', true, true);

const savedConsent = readSavedConsent();
if (savedConsent) {
  applyConsent(savedConsent);
}

const onUserConsent = function(consent) {
  if (!isValidConsent(consent)) {
    return;
  }
  applyConsent(consent);
};

addEventCallback(function() {
  callInWindow('CookiePlugin_addGtmConsentListener', onUserConsent);
});

data.gtmOnSuccess();

___WEB_PERMISSIONS___

${webPermissions}

___TESTS___

scenarios: []

___NOTES___

Install on Consent Initialization - All Pages in this order:
1. gtm-consent-bridge.html
2. This template tag
3. gtm-consent-tag.html
`;

writeFileSync(outPath, '\uFEFF' + template, 'utf8');
console.log(`Built ${outPath}`);
