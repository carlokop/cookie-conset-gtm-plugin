import { init } from './plugin.js';

init();

export { init } from './plugin.js';
export { mergeConfig } from './config.js';
export { readScriptConfig } from './script-config.js';
export {
  mapConsentToGoogle,
  createConsentRecord,
  applyDefaultConsent,
  applyConsentUpdate,
  DEFAULT_CONSENT_MODE,
} from './consent-mode.js';
export { readConsentCookie, writeConsentCookie, isConsentValid } from './cookie-storage.js';
