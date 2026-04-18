import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { requestLogger } from './utils/logger.js';
import { globalErrorHandler } from './utils/errors.js';
import apiRouter from './routes/api.js';

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin requests (no Origin header) in all environments
      if (!origin) return callback(null, true);
      if (config.ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy does not allow origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '64kb' }));

// ─── Request logging ──────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Route not found.' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(config.PORT, () => {
  const divider = '─'.repeat(52);
  console.log(`\n${divider}`);
  console.log('  TeraBox Downloader — API Server');
  console.log(divider);
  console.log(`  Mode        : ${config.NODE_ENV}`);
  console.log(`  Listening   : http://localhost:${config.PORT}`);
  console.log(`  Health      : http://localhost:${config.PORT}/api/health`);
  console.log(`  Resolve     : POST http://localhost:${config.PORT}/api/resolve`);
  console.log(`  CORS allow  : ${config.ALLOWED_ORIGINS.join(', ')}`);
  console.log(`${divider}\n`);
});
