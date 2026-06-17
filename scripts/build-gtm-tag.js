import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as babel from '@babel/core';

const root = resolve(import.meta.dirname, '..');
const bundlePath = resolve(root, 'dist/cookie-consent.min.js');
const inventoryPath = resolve(root, process.argv[2] || 'demo/cookie-inventory.json');
const privacyPolicyUrl = process.argv[3] || '/privacy-policy';
const outPath = resolve(root, 'dist/gtm-consent-tag.html');
const es5BundlePath = resolve(root, 'dist/cookie-consent.gtm.js');

if (!existsSync(bundlePath)) {
  console.error('Run npm run build first (missing dist/cookie-consent.min.js)');
  process.exit(1);
}

/** @type {{ version?: number; items?: unknown[] }} */
let inventory = { version: 1, items: [] };

if (existsSync(inventoryPath)) {
  inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
}

const bundle = readFileSync(bundlePath, 'utf8');

const transpiled = babel.transformSync(bundle, {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { ie: '11' },
        modules: false,
      },
    ],
  ],
  minified: true,
  comments: false,
  compact: true,
});

if (!transpiled?.code) {
  console.error('Babel transpilation failed');
  process.exit(1);
}

const es5Bundle = transpiled.code;
assertGtmCompatible(es5Bundle);
writeFileSync(es5BundlePath, es5Bundle, 'utf8');

const config = {
  consentVersion: 1,
  privacyPolicyUrl,
  cookieInventory: {
    version: inventory.version ?? 1,
    items: inventory.items ?? [],
  },
};

const html = `<!--
  GTM Custom HTML tag — consent UI (ES5).
  Trigger: Consent Initialization - All Pages

  Required tag order on the same trigger:
  1. gtm-consent-bridge.html
  2. gtm-consent-template.tpl (import as template tag)
  3. this gtm-consent-tag.html
-->
<script>
  window.CookiePluginConfig = ${JSON.stringify(config, null, 2)};
</script>
<script>
${es5Bundle}
</script>
`;

writeFileSync(outPath, html, 'utf8');

const sizeKb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);
console.log(`Built ${outPath} (${sizeKb} KB, ES5)`);
console.log(`Built ${es5BundlePath}`);
console.log('GTM setup (Consent Initialization - All Pages):');
console.log('1. dist/gtm-consent-bridge.html');
console.log('2. dist/gtm-consent-template.tpl (import as template)');
console.log('3. dist/gtm-consent-tag.html');

/**
 * GTM Custom HTML tags only accept ECMAScript 5 (Closure Compiler).
 * @param {string} code
 */
function assertGtmCompatible(code) {
  const violations = [
    [/=>/, 'arrow function'],
    [/\b(let|const)\b/, 'let/const'],
    [/`/, 'template literal'],
    [/\basync\b/, 'async'],
    [/\.\.\./, 'spread/rest'],
  ].filter(([pattern]) => pattern.test(code));

  if (violations.length > 0) {
    console.error(
      'GTM ES5 check failed:',
      violations.map(([, name]) => name).join(', ')
    );
    process.exit(1);
  }
}
