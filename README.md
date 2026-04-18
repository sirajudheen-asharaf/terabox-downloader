# TeraBox Downloader

A full-stack deployment-ready application for managing and resolving TeraBox share links at scale.

- **Frontend**: Vite + React + Tailwind — dark-themed dashboard with bulk input, queue management, results table, CSV export, and localStorage persistence
- **Backend**: Node.js + Express — structured API service with CORS, input validation, and a documented integration point for lawful resolution

> ⚠️ **Operator note:** This backend currently returns truthful failure responses. Real URL resolution requires a licensed or authorized integration. See [Backend Integration](#backend-integration) below.

## 🚀 Live Production

| | URL |
|---|---|
| **Frontend** | https://terabox-downloader-pied.vercel.app |
| **Backend** | https://terabox-downloader-api-ik82.onrender.com |
| **Health Check** | https://terabox-downloader-api-ik82.onrender.com/api/health |
| **GitHub** | https://github.com/sirajudheen-asharaf/terabox-downloader |

---

## Architecture

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│  Frontend (Vite/React)          │      │  Backend (Node.js/Express)      │
│  localhost:5173                 │─────▶│  localhost:3001                 │
│                                 │      │                                 │
│  src/app/                       │      │  server/                        │
│  ├── components/                │      │  ├── config/   (env, hosts)     │
│  ├── pages/                     │      │  ├── routes/   (api.js)         │
│  ├── services/  (api.ts)        │      │  ├── services/ (resolver.js)    │
│  ├── utils/     (storage,parser)│      │  └── utils/    (validate,logger)│
│  └── types.ts                   │      │                                 │
└─────────────────────────────────┘      └─────────────────────────────────┘
```

---

## Local Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
npm run server:install
# or: cd server && npm install
```

### 3. Configure environment

```bash
# Frontend env (optional for local dev — defaults to same-origin)
cp .env.example .env.local

# Backend env
cp server/.env.example server/.env
```

Edit `server/.env`:
```
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Run both together

```bash
npm run dev:all
```

Or run separately in two terminals:

```bash
# Terminal 1 — frontend
npm run dev

# Terminal 2 — backend
npm run server:dev
```

Frontend → `http://localhost:5173`  
Backend → `http://localhost:3001`

---

## Environment Variables

### Frontend (Vite)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `""` (same-origin) | Base URL of the backend. Omit to use same-origin routing. |

> Vite exposes `VITE_*` vars to the browser bundle. Do not put secrets here.

### Backend (Express)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Port the server listens on |
| `NODE_ENV` | `development` | Environment mode. Set to `production` in deployments. |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated list of CORS-allowed frontend origins |

---

## API Contract

### `GET /api/health`

Returns 200 as long as the backend process is running.

```json
{
  "ok": true,
  "service": "terabox-resolver",
  "version": "1.0.0",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

### `POST /api/resolve`

**Request:**
```http
POST /api/resolve
Content-Type: application/json

{
  "url": "https://www.terabox.com/s/1abc...",
  "outputMode": "download"
}
```

**Success response (200):**
```json
{
  "ok": true,
  "title": "Video title",
  "quality": "720p",
  "duration": "03:24",
  "outputUrl": "https://cdn.example.com/video.mp4",
  "thumbnail": "https://cdn.example.com/thumb.jpg"
}
```

**Application-level failure (200, ok: false):**
```json
{
  "ok": false,
  "error": "Human-readable reason"
}
```

**Validation failure (400):**
```json
{
  "ok": false,
  "error": "Missing required field: url."
}
```

#### Supported domains

- `terabox.com`
- `1024terabox.com`
- `teraboxapp.com`

To add more, edit `server/config/hosts.js`.

#### outputMode values

| Value | Meaning |
|-------|---------|
| `download` | Caller intends to download the file |
| `stream` | Caller intends to stream the file |

---

## Backend Integration

The backend is fully structured and production-ready. The resolution service at `server/services/resolver.js` currently returns:

```json
{
  "ok": false,
  "error": "This backend is not configured for real source resolution."
}
```

To integrate real resolution:

1. Edit `server/services/resolver.js`
2. Replace the body of `performResolution(url, outputMode)` with your authorized implementation
3. Return the success shape:
   ```js
   return { ok: true, title, quality, duration, outputUrl, thumbnail };
   ```

**Rules:**
- Only process content the operator is authorized to handle
- Do not implement bypass, evasion, or scraping of access controls
- The backend must remain lawful and explicit

---

## Production Build & Deployment

### Frontend

```bash
# Build static assets
npm run build

# Preview the production build locally
npm run preview
```

Outputs to `dist/`. Deploy to any static host: **Vercel**, **Netlify**, **Cloudflare Pages**, **S3 + CloudFront**, etc.

Set `VITE_API_BASE_URL` in your hosting platform to point at your backend URL:
```
VITE_API_BASE_URL=https://api.your-domain.com
```

Or use same-origin deployment (proxy `/api` through your web server/CDN) and omit the variable.

---

### Backend

```bash
cd server
npm install --omit=dev
npm start
```

Deploy to any Node.js host: **Railway**, **Render**, **Fly.io**, **Heroku**, **EC2**, **Cloud Run**, etc.

Required environment variables for production:
```
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

No build step is required. The server uses ES modules natively (Node 18+).

---

## npm Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `vite` | Start frontend dev server |
| `npm run build` | `vite build` | Build frontend for production |
| `npm run preview` | `vite preview` | Preview production build locally |
| `npm run server:install` | `cd server && npm install` | Install backend dependencies |
| `npm run server:dev` | `cd server && npm run dev` | Start backend with hot-reload (`node --watch`) |
| `npm run server:start` | `cd server && npm start` | Start backend in production mode |
| `npm run dev:all` | `concurrently ...` | Run frontend + backend together |

---

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── components/          # Presentational components
│   │   │   ├── BackendContractPanel.tsx
│   │   │   ├── BulkInputPanel.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── QueuePreview.tsx
│   │   │   ├── ResultsTable.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── VideoPreviewModal.tsx
│   │   ├── pages/
│   │   │   └── HomePage.tsx     # Page orchestration
│   │   ├── services/
│   │   │   └── api.ts           # API client (POST /api/resolve)
│   │   ├── utils/
│   │   │   ├── storage.ts       # localStorage + CSV export
│   │   │   └── teraboxParser.ts # URL extraction + file parsing
│   │   ├── types.ts             # Shared TypeScript types
│   │   ├── App.tsx
│   │   └── routes.tsx
│   └── styles/
├── server/
│   ├── config/
│   │   ├── hosts.js             # Supported domain list
│   │   └── index.js             # Environment config
│   ├── routes/
│   │   └── api.js               # GET /api/health, POST /api/resolve
│   ├── services/
│   │   └── resolver.js          # Resolution service (integration point)
│   ├── utils/
│   │   ├── errors.js            # Error formatting
│   │   ├── logger.js            # Request logger
│   │   └── validate.js          # Input validation
│   ├── types.js                 # JSDoc types
│   ├── index.js                 # Server bootstrap
│   ├── package.json
│   └── .env.example
├── .env.example
├── package.json
├── vite.config.ts
└── README.md
```

---

## What the Backend Does and Does Not Do

| Does | Does Not |
|------|----------|
| ✅ Validates input shape and required fields | ❌ Generate or fabricate media metadata |
| ✅ Checks URL for supported TeraBox hosts | ❌ Implement bypass, evasion, or scraping |
| ✅ Returns truthful structured failure responses | ❌ Process content without operator authorization |
| ✅ Applies CORS, body size limits, and request logging | ❌ Expose stack traces in production |
| ✅ Provides a documented integration point for real resolution | ❌ Pretend to resolve when no integration exists |

---

## No Fake Success

There is no fake-success path anywhere in this codebase:

- The frontend API client (`src/app/services/api.ts`) throws on every failure path — network errors, HTTP errors, malformed JSON, `ok: false` responses, and missing `outputUrl` fields
- The backend resolver service (`server/services/resolver.js`) returns explicit failure until a real integration is provided
- Preview buttons in the results table are only shown when a real `outputUrl` is present
- The backend health pill in the nav reflects actual `/api/health` reachability"# terabox-downloader" 
