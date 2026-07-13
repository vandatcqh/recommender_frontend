// API base URL — resolved at build time for Vercel, proxied locally in dev.
// Vercel: keep default "/api" (vercel.json rewrites proxy to backend)
// Local dev: vite.config.js proxies /api → localhost:8000
export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export function apiUrl(path = '') {
  const base = API_BASE.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
