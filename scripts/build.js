import * as esbuild from 'esbuild';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const watch = process.argv.includes('--watch');

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

if (watch) {
  const contexts = await Promise.all(
    builds.map((build) => esbuild.context({ ...sharedOptions, ...build }))
  );
  await Promise.all(contexts.map((context) => context.watch()));
  console.log('Watching for changes...');
} else {
  await Promise.all(builds.map((build) => esbuild.build({ ...sharedOptions, ...build })));
  for (const build of builds) {
    console.log(`Built ${build.outfile}`);
  }
}
