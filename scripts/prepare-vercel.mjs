/**
 * Optional: refresh vercel.json SPA fallback before build.
 * API is proxied via api/[...path].js serverless function (supports POST).
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const config = {
  rewrites: [
    {
      source: '/((?!api).*)',
      destination: '/index.html',
    },
  ],
};

writeFileSync(join(root, 'vercel.json'), `${JSON.stringify(config, null, 2)}\n`);
console.log('vercel.json updated (SPA fallback only; API via serverless proxy)');
