/**
 * Generate vercel.json with API proxy rewrite before build.
 * Set API_PROXY_TARGET in Vercel env (or .env.production.local).
 *
 * Example: API_PROXY_TARGET=http://32.236.189.44:8000
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const target = (
  process.env.API_PROXY_TARGET ||
  process.env.VITE_API_PROXY ||
  'http://32.236.189.44:8000'
).replace(/\/$/, '');

const config = {
  rewrites: [
    {
      source: '/api/:path*',
      destination: `${target}/api/:path*`,
    },
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ],
};

writeFileSync(join(root, 'vercel.json'), `${JSON.stringify(config, null, 2)}\n`);
console.log(`vercel.json → proxy /api/* to ${target}/api/*`);
