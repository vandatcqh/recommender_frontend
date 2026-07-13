# Deploy lên Vercel

Repo này **chỉ chứa frontend**. Backend chạy trên server riêng.

## Cách hoạt động

```
Browser → https://xxx.vercel.app/api/*  →  Vercel serverless proxy  →  http://<server>:8000/api/*
Browser → https://xxx.vercel.app/*      →  React SPA
```

Serverless proxy (`api/[...path].js`) hỗ trợ POST (đăng nhập, đăng ký) — rewrite trực tiếp trên Vercel thường bị 405.

## Bước deploy

### 1. Backend phải online

```bash
# Trên server backend
curl http://32.236.189.44:8000/api/health
# → {"status":"ok"}
```

### 2. Import GitHub → Vercel

1. [vercel.com/new](https://vercel.com/new) → Import repo `recommender_frontend`
2. Cấu hình (mặc định Vite thường đúng):

| Setting | Value |
|---|---|
| Framework | Vite |
| **Build Command** | `npm run build:vercel` |
| **Output Directory** | `dist` |
| Root Directory | *(để trống — repo root là frontend)* |

### 3. Environment Variable

| Name | Value |
|---|---|
| `API_PROXY_TARGET` | `http://32.236.189.44:8000` |

### 4. Deploy

URL: `https://recommender-frontend-xxx.vercel.app`

## Đổi server backend

Cập nhật `API_PROXY_TARGET` trên Vercel Dashboard → Redeploy.

## Local dev

```bash
npm install
npm run dev
```

Vite proxy `/api` → `http://127.0.0.1:8000` (cần backend local).

## Routes

| Path | Trang |
|---|---|
| `/login` | Đăng nhập / đăng ký |
| `/home` | Trang chủ |
| `/recommendations` | Gợi ý sản phẩm |
| `/admin/recommender-metrics` | Dashboard metrics |
