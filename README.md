# Cookie Consent Plugin

Lightweight cookie consent plugin for Google Tag Manager with Google Consent Mode v2 and `cp_consent_update` dataLayer events.

## Features

- Centered consent banner on first visit
- Accept all, reject all, and customize preferences
- Switches for functional, analytics, and marketing cookies
- Consent stored in cookie (`cp_cookie_consent`)
- Google Consent Mode v2 mapping
- `cp_consent_update` event in dataLayer after consent update

## Installation

```bash
npm install
npm run build
npm test
```

`npm run build` generates everything in one step:

| File | Purpose |
|------|---------|
| `dist/cookie-consent.min.js` | Consent banner (website or demo) |
| `dist/cookie-scanner.min.js` | Cookie inventory scanner |
| `dist/cookie-consent.gtm.js` | ES5 bundle for GTM |
| `dist/gtm-consent-bridge.html` | GTM bridge tag (step 1) |
| `dist/gtm-consent-template.tpl` | GTM consent template (step 2) |
| `dist/gtm-consent-tag.html` | GTM UI tag with inline inventory (step 3) |

With a custom inventory and privacy URL:

```bash
npm run build -- path/to/cookie-inventory.json https://www.yoursite.com/privacy-policy
```

By default the build uses `demo/cookie-inventory.json` and `/privacy-policy`.

## Creating the cookie inventory (step by step)

The inventory is a JSON file listing all cookies, scripts, and trackers on your site. The consent banner shows this list on the **Details** tab.

### Step 1 — Build the project

```bash
npm install
npm run build
```

This produces `dist/cookie-scanner.min.js`.

### Step 2 — Make the scanner available

Choose one of these options:

**Option A — Local testing (fastest)**

Serve the `dist/` folder and open your live site. Temporarily add this in the browser console:

```js
var s = document.createElement('script');
s.src = 'http://localhost:8080/cookie-scanner.min.js';
document.head.appendChild(s);
```

**Option B — On your server**

Upload `dist/cookie-scanner.min.js` to your domain, for example:

`https://www.yoursite.com/cookie-scanner.min.js`

### Step 3 — Run the scan on the live site

1. Open your **live website** in Chrome or Edge (not localhost only).
2. Ensure **GTM is published** and all tags (analytics, ads, pixels) load normally.
3. Visit pages where your tags are active (homepage, forms, checkout, etc.).
4. Start the scan:

```js
CookieScanner.run({ monitorSeconds: 10 });
```

The scanner monitors for 10 seconds, then downloads `cookie-inventory.json`.

> Tip: repeat the scan after visiting additional pages if you want to capture more tags.

### Step 4 — Save the JSON in your project

1. Rename or move the downloaded file, for example:

   `sites/yoursite/cookie-inventory.json`

2. Open the file in your editor.

### Step 5 — Edit the JSON manually

Review and fill in each item:

| Field | What to enter |
|-------|---------------|
| `category` | `functional`, `analytics`, `marketing`, or `unclassified` |
| `provider` | Provider name (e.g. Google Analytics) |
| `description` | Short explanation for visitors |
| `retention` | Retention period (e.g. `2 years`, `Session`) — adjust if the scan got it wrong |

Remove items that do not belong on your site. Move misclassified items to the correct category.

Example item:

```json
{
  "type": "cookie",
  "name": "_ga",
  "category": "analytics",
  "provider": "Google Analytics",
  "description": "Registers visit statistics.",
  "retention": "2 years"
}
```

For cookies, the scan tries to detect retention via the Cookie Store API (Chrome/Edge). If that fails, a known value from the pattern list is used.

### Step 6 — Build with your inventory

```bash
npm run build -- sites/yoursite/cookie-inventory.json https://www.yoursite.com/privacy-policy
```

The inventory is inlined in `dist/gtm-consent-tag.html`.

### Step 7 — Verify

Open `demo/index.html` (after build) or test the GTM tag in Preview. Go to the **Details** tab and confirm cookies are listed correctly per category.

### When to scan again

- New marketing or analytics tags in GTM
- New third-party scripts on the site
- Major site changes (new checkout, login, etc.)

**Workflow when things change:** scan → edit JSON → `npm run build -- ...` → paste GTM tags again → publish.

## Usage on any website (without GTM)

Load the script and pass your privacy policy URL and cookie inventory via data attributes:

```html
<script
  src="https://yourdomain.com/cookie-consent.min.js"
  data-privacy-policy-url="/privacy-policy"
  data-cookie-inventory="/cookie-inventory.json"
></script>
```

You can also set options before the script:

```html
<script>
  window.CookiePluginConfig = {
    consentVersion: 1,
    cookieName: 'cp_cookie_consent',
    cookieMaxAgeDays: 180,
    privacyPolicyUrl: '/privacy-policy',
    texts: {
      title: 'We use cookies',
      description: 'We use cookies to run the website, analyze usage, and improve marketing.'
    }
  };
</script>
<script src="https://yourdomain.com/cookie-consent.min.js"></script>
```

`CookiePluginConfig` overrides values from data attributes on the script element.

Without an inventory, the banner still works (consent, switches, Consent Mode), but the Details tab will not show a concrete cookie list.

## Google Tag Manager

Three tags on trigger **Consent Initialization - All Pages**, in this order:

| # | File | Type in GTM |
|---|------|-------------|
| 1 | `dist/gtm-consent-bridge.html` | Custom HTML |
| 2 | `dist/gtm-consent-template.tpl` | Import template → create tag |
| 3 | `dist/gtm-consent-tag.html` | Custom HTML |

### Steps

1. Create and edit your cookie inventory (see above).
2. Run `npm run build -- your/cookie-inventory.json https://www.yoursite.com/privacy-policy`.
3. Import `dist/gtm-consent-template.tpl` as a template in GTM. Approve permissions on the Permissions tab.
4. Create three tags (bridge, template, UI) on **Consent Initialization - All Pages** in the order above.
5. Paste the full contents of `gtm-consent-bridge.html` and `gtm-consent-tag.html` into the Custom HTML tags.
6. Publish GTM and test in Preview (Consent tab + `cp_consent_update` event).

The UI tag contains:

- `window.CookiePluginConfig` with inventory inlined
- The full plugin code inlined, transpiled to **ES5** (required for GTM Custom HTML)

### Manual setup (without build script)

```html
<script>
  window.CookiePluginConfig = {
    consentVersion: 1,
    privacyPolicyUrl: '/privacy-policy',
    cookieInventory: {
      version: 1,
      items: [ /* ... */ ]
    }
  };
</script>
<script>
  /* paste contents of dist/cookie-consent.gtm.js here */
</script>
```

`CookiePluginConfig` must appear **before** the plugin code.

## DataLayer event

After a consent choice, the plugin pushes:

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

Use `cp_consent_update` as a custom event trigger for tags that should only fire after consent.

## Demo

Open `demo/index.html` in the browser after `npm run build`.

## API

After init, `window.CookiePlugin` is available:

- `CookiePlugin.getConsent()` — current consent state
- `CookiePlugin.openPreferences()` — open preferences screen

## Consent mapping

| Category  | Google Consent Mode keys |
|-----------|--------------------------|
| Functional | `functionality_storage` |
| Analytics | `analytics_storage` |
| Marketing | `ad_storage`, `ad_user_data`, `ad_personalization`, `personalization_storage` |
| Always on | `security_storage` |
