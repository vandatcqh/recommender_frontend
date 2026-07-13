/**
 * Refresh vercel.json before build (SPA fallback + API rewrite to proxy).
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const config = {
  buildCommand: 'npm run build:vercel',
  outputDirectory: 'dist',
  rewrites: [
    { source: '/api/(.*)', destination: '/api/proxy?path=$1' },
    { source: '/((?!api).*)', destination: '/index.html' },
  ],
  functions: {
    'api/proxy.js': { maxDuration: 30 },
  },
};

writeFileSync(join(root, 'vercel.json'), `${JSON.stringify(config, null, 2)}\n`);
console.log('vercel.json updated');
