const TARGET = (process.env.API_PROXY_TARGET || 'http://3.26.158.53:8000').replace(/\/$/, '');

export default async function handler(req, res) {
  const rawPath = req.query.path;
  const apiPath = Array.isArray(rawPath) ? rawPath.join('/') : (rawPath || '');

  const url = new URL(`${TARGET}/api/${apiPath}`);
  const q = new URLSearchParams(req.query);
  q.delete('path');
  const qs = q.toString();
  if (qs) url.search = qs;

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    const lower = key.toLowerCase();
    if (['host', 'connection', 'content-length'].includes(lower)) continue;
    if (value) headers[key] = value;
  }

  const method = req.method || 'GET';
  const init = { method, headers };

  if (!['GET', 'HEAD'].includes(method) && req.body != null) {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!headers['content-type'] && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const proxyRes = await fetch(url.toString(), init);
    const text = await proxyRes.text();

    res.status(proxyRes.status);
    proxyRes.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.send(text);
  } catch (err) {
    res.status(502).json({
      detail: 'Backend unavailable',
      target: TARGET,
      error: String(err?.message || err),
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
