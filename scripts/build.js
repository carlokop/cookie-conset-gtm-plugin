import * as esbuild from 'esbuild';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const watch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/index.js'],
  outfile: 'dist/cookie-consent.min.js',
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'CookieConsentPlugin',
  target: ['es2018'],
  legalComments: 'none',
};

mkdirSync(dirname(buildOptions.outfile), { recursive: true });

if (watch) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Built dist/cookie-consent.min.js');
}
