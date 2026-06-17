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

Het build-resultaat staat in:

- `dist/cookie-consent.min.js` — consent banner
- `dist/cookie-scanner.min.js` — eenmalige cookie scan

## Gebruik op elke website

Laad het script en geef de URL naar je privacybeleid en cookie-inventaris mee via data-attributen:

```html
<script
  src="https://jouwdomein.nl/cookie-consent.min.js"
  data-privacy-policy-url="/privacybeleid"
  data-cookie-inventory="/cookie-inventory.json"
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

## Cookie scan workflow

1. Open je live website (pagina waar GTM/analytics actief zijn)
2. Laad het scan-script:

```html
<script src="https://jouwdomein.nl/cookie-scanner.min.js"></script>
```

Of roep handmatig aan:

```js
CookieScanner.run({ monitorSeconds: 10 });
```

3. Er wordt `cookie-inventory.json` gedownload met cookies, storage en third-party trackers (geen eigen API-calls of technische JS-chunks)
4. **Bewerk het JSON-bestand handmatig** (categorie, provider, beschrijving)
5. Gebruik de inventaris in GTM (inline) of deploy als `/cookie-inventory.json` op je server
6. De consent banner toont de inventaris in het Details-tabblad

Voorbeeld inventory item:

```json
{
  "type": "cookie",
  "name": "_ga",
  "category": "analytics",
  "provider": "Google Analytics",
  "description": "Registreert bezoekstatistieken."
}
```

Bij cookies probeert de scan de **bewaartermijn** te bepalen via de Cookie Store API (Chrome/Edge). Als dat niet lukt, wordt een bekende termijn uit de patroonlijst gebruikt (bijv. `_ga` → 2 jaar). Het veld `retention` is handmatig aanpasbaar in het JSON-bestand.

## Google Tag Manager

### Optie A: Inventaris inline in GTM (geen server-upload)

Plak de inhoud van je `cookie-inventory.json` direct in een GTM **Custom HTML** tag. Geen apart bestand op je server nodig.

1. Maak een **Custom HTML** tag in GTM
2. Stel de trigger in op **Consent Initialization - All Pages**
3. Gebruik dit template:

```html
<script>
  window.CookiePluginConfig = {
    consentVersion: 1,
    privacyPolicyUrl: '/privacybeleid',
    cookieInventory: {
      version: 1,
      items: [
        {
          type: 'cookie',
          name: '_ga',
          category: 'analytics',
          provider: 'Google Analytics',
          description: 'Registreert bezoekstatistieken.'
        },
        {
          type: 'cookie',
          name: '_fbp',
          category: 'marketing',
          provider: 'Meta',
          description: ''
        }
      ]
    }
  };
</script>
<script src="https://jouwdomein.nl/cookie-consent.min.js"></script>
```

**Workflow bij cookie-wijzigingen:** scan → bewerk JSON → plak bijgewerkte `items` in GTM → publiceer GTM.

**Tip:** gebruik een GTM **Custom JavaScript-variabele** voor de inventaris als je die op meerdere plekken nodig hebt:

```js
function() {
  return {
    version: 1,
    items: [ /* ... */ ]
  };
}
```

En in je tag: `cookieInventory: {{Cookie Inventory Variable}}`

Inline config (`cookieInventory`) heeft voorrang boven `cookieInventoryUrl`.

### Optie B: Inventaris via URL (server)

1. Host `dist/cookie-consent.min.js` en `cookie-inventory.json` op je domein
2. Maak een **Custom HTML** tag in GTM
3. Stel de trigger in op **Consent Initialization - All Pages**

```html
<script
  src="https://jouwdomein.nl/cookie-consent.min.js"
  data-privacy-policy-url="/privacybeleid"
  data-cookie-inventory="/cookie-inventory.json"
></script>
```

Bij cookie-wijzigingen hoef je GTM niet aan te passen — alleen het JSON-bestand op de server.

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
