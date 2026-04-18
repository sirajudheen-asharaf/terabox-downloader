import { config } from '../config/index.js';

/**
 * Sends a structured error response.
 * In production, never include stack traces or internal details.
 *
 * @param {import('express').Response} res
 * @param {number} status  HTTP status code
 * @param {string} message Human-readable error message safe to send to clients
 */
export function sendError(res, status, message) {
  res.status(status).json({ ok: false, error: message });
}

/**
 * Express error-handling middleware.
 * Mount last in the app stack.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function globalErrorHandler(err, req, res, _next) {
  console.error('[server] Unhandled error:', err);

  const message = config.IS_PRODUCTION
    ? 'An internal server error occurred.'
    : (err.message ?? 'Unknown error');

  res.status(500).json({ ok: false, error: message });
}
