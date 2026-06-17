import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const outPath = resolve(import.meta.dirname, '../dist/gtm-consent-bridge.html');

const html = `<!--
  GTM Custom HTML tag — bridge bootstrap (ES5).
  Trigger: Consent Initialization - All Pages
  Plaats deze tag BOVEN de Cookie Plugin Consent API template-tag.
-->
<script>
(function(w) {
  w.CookiePlugin_gtmConsentListeners = w.CookiePlugin_gtmConsentListeners || [];
  w.CookiePluginGtmConsentActive = w.CookiePluginGtmConsentActive || false;
  w.CookiePlugin_addGtmConsentListener = w.CookiePlugin_addGtmConsentListener || function(listener) {
    if (typeof listener === 'function') {
      w.CookiePlugin_gtmConsentListeners.push(listener);
    }
  };
  w.CookiePlugin_pushDataLayerEvent = w.CookiePlugin_pushDataLayerEvent || function(payload) {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(payload);
  };
  w.CookiePlugin_setGtmConsentActive = w.CookiePlugin_setGtmConsentActive || function(active) {
    w.CookiePluginGtmConsentActive = !!active;
  };
})(window);
</script>
`;

writeFileSync(outPath, html, 'utf8');
console.log(`Built ${outPath}`);
