# StyleRate — Frontend

Giao diện web đánh giá & gợi ý thời trang (React + Vite).

Backend API chạy riêng trên server — frontend deploy lên **Vercel**.

## Chạy local

```bash
npm install
cp .env.example .env.local   # optional

# Cần backend chạy ở localhost:8000
npm run dev
```

Mở http://localhost:5173

## Deploy Vercel

1. Import repo này lên [vercel.com](https://vercel.com)
2. **Build Command:** `npm run build:vercel`
3. **Output Directory:** `dist`
4. **Env:** `API_PROXY_TARGET=http://<server-ip>:8000`

Chi tiết: [VERCEL.md](VERCEL.md)

## Cấu trúc

```
src/
  pages/          # Login, Home, Category, Recommendations, Admin...
  components/     # Navbar, ProductCard, RatingModal...
  api/            # Axios client → /api (proxy tới backend)
```

## Backend

Repo backend riêng: [KLTN](https://github.com/ttv0708/KLTN) (hoặc server `32.236.189.44:8000`).
