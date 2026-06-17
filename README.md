# Cookie Consent Plugin

Lightweight cookie consent plugin voor Google Tag Manager met Google Consent Mode v2 en `cp_consent_update` dataLayer events.

## Features

- Gecentreerde consent banner bij eerste bezoek
- `Alles accepteren`, `Alles weigeren` en `Voorkeuren aanpassen`
- Switches voor functionele, analytische en marketing cookies
- Consent opslag in cookie (`cp_cookie_consent`)
- Google Consent Mode v2 mapping
- `cp_consent_update` event in dataLayer na consent update

## Installatie

```bash
npm install
npm run build
npm test
```

Het build-resultaat staat in `dist/cookie-consent.min.js`.

## Google Tag Manager

1. Host `dist/cookie-consent.min.js` op je domein.
2. Maak een **Custom HTML** tag in GTM.
3. Stel de trigger in op **Consent Initialization - All Pages**.
4. Laad het script zo vroeg mogelijk.

## Gebruik op elke website

Laad het script en geef de URL naar je privacybeleid mee via een data-attribuut:

```html
<script
  src="https://jouwdomein.nl/cookie-consent.min.js"
  data-privacy-policy-url="/privacybeleid"
></script>
```

Je kunt ook extra opties instellen vóór het script:

```html
<script>
  window.CookiePluginConfig = {
    consentVersion: 1,
    cookieName: 'cp_cookie_consent',
    cookieMaxAgeDays: 180,
    privacyPolicyUrl: '/privacybeleid',
    texts: {
      title: 'Wij gebruiken cookies',
      description: 'We gebruiken cookies om de website goed te laten werken, gebruik te analyseren en marketing te verbeteren.'
    }
  };
</script>
<script src="https://jouwdomein.nl/cookie-consent.min.js"></script>
```

`CookiePluginConfig` overschrijft waarden uit data-attributen op het script-element.

## DataLayer event

Na een consent keuze pusht de plugin:

```js
{
  event: 'cp_consent_update',
  consent: {
    functional: true,
    analytics: true,
    marketing: false
  },
  consentMode: {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted'
  }
}
```

Gebruik `cp_consent_update` als custom event trigger voor tags die pas na consent mogen afgaan.

## Demo

Open `demo/index.html` in de browser na `npm run build`.

## API

Na init is `window.CookiePlugin` beschikbaar:

- `CookiePlugin.getConsent()` - huidige consent state
- `CookiePlugin.openPreferences()` - voorkeurenscherm openen

## Consent mapping

| Categorie   | Google Consent Mode keys                                      |
|-------------|---------------------------------------------------------------|
| Functioneel | `functionality_storage`                                       |
| Analytisch  | `analytics_storage`                                           |
| Marketing   | `ad_storage`, `ad_user_data`, `ad_personalization`, `personalization_storage` |
| Altijd aan  | `security_storage`                                            |
