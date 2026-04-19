import 'dotenv/config';

/**
 * Central environment configuration.
 * All env var access should go through this module — never read process.env directly in route/service code.
 */

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

/**
 * Comma-separated list of allowed CORS origins.
 * Defaults to localhost:5173 (Vite default) in development.
 * In production, set ALLOWED_ORIGINS explicitly.
 */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

/**
 * Resolver network timeout in milliseconds.
 * Increase if the backend sits behind a slow network path.
 * Decrease for faster fail-fast behaviour in production.
 */
const RESOLVER_TIMEOUT_MS = parseInt(process.env.RESOLVER_TIMEOUT_MS ?? '15000', 10);

export const config = {
  PORT,
  NODE_ENV,
  IS_PRODUCTION,
  ALLOWED_ORIGINS,
  RESOLVER_TIMEOUT_MS,
};
