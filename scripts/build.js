import * as esbuild from 'esbuild';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const watch = process.argv.includes('--watch');
const buildArgs = process.argv.slice(2).filter((arg) => arg !== '--watch');

const builds = [
  {
    entryPoints: ['src/index.js'],
    outfile: 'dist/cookie-consent.min.js',
    globalName: 'CookieConsentPlugin',
  },
  {
    entryPoints: ['src/scan/index.js'],
    outfile: 'dist/cookie-scanner.min.js',
    globalName: 'CookieScanner',
  },
];

const sharedOptions = {
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2018'],
  legalComments: 'none',
};

mkdirSync('dist', { recursive: true });

async function buildBundles() {
  await Promise.all(builds.map((build) => esbuild.build({ ...sharedOptions, ...build })));
  for (const build of builds) {
    console.log(`Built ${build.outfile}`);
  }
}

function buildGtmAssets() {
  const scripts = ['build-gtm-bridge.js', 'build-gtm-template.js', 'build-gtm-tag.js'];

  for (const script of scripts) {
    const args = script === 'build-gtm-tag.js' ? buildArgs : [];
    const result = spawnSync('node', [resolve('scripts', script), ...args], {
      stdio: 'inherit',
    });

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

if (watch) {
  const contexts = await Promise.all(
    builds.map((build) => esbuild.context({ ...sharedOptions, ...build }))
  );
  await Promise.all(contexts.map((context) => context.watch()));
  console.log('Watching for changes...');
} else {
  await buildBundles();
  buildGtmAssets();
}
