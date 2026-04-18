import { Router } from 'express';
import { validateResolveRequest } from '../utils/validate.js';
import { resolveUrl } from '../services/resolver.js';
import { sendError } from '../utils/errors.js';

const router = Router();

// ─── GET /api/health ─────────────────────────────────────────────────────────

/**
 * Health check endpoint.
 * Frontend uses this to verify backend connectivity.
 * Returns 200 as long as the server process is running.
 */
router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'terabox-resolver',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── POST /api/resolve ────────────────────────────────────────────────────────

/**
 * Main resolution endpoint.
 *
 * Request body:
 *   { url: string, outputMode: 'download' | 'stream' }
 *
 * Success response (200):
 *   { ok: true, title, quality, duration, outputUrl, thumbnail }
 *
 * Failure response (200 with ok:false, or 4xx/5xx):
 *   { ok: false, error: string }
 *
 * Note: resolution failures are returned as HTTP 200 with ok:false
 * (application-level failure), while input errors are returned as HTTP 4xx.
 */
router.post('/resolve', async (req, res, next) => {
  try {
    // ── Validate input ──────────────────────────────────────────────────────
    const validation = validateResolveRequest(req.body);
    if (!validation.valid) {
      return sendError(res, validation.status, validation.error);
    }

    const { url, outputMode } = req.body;

    // ── Delegate to service layer ───────────────────────────────────────────
    const result = await resolveUrl(url, outputMode);

    // ── Return result (success or application-level failure) ────────────────
    return res.json(result);

  } catch (err) {
    // Unexpected error — pass to global error handler
    return next(err);
  }
});

export default router;
