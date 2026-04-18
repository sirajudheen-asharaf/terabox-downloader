import { isSupportedHost } from '../config/hosts.js';

/**
 * Resolution service.
 *
 * This service layer is structured for production integration:
 *   1. Supported-host guard (rejects unknown domains before any network call)
 *   2. Resolution attempt (reserved for operator-provided integration)
 *   3. Truthful response — never fabricates metadata
 *
 * HOW TO INTEGRATE A REAL BACKEND
 * ─────────────────────────────────────────────────────────────────────────────
 * Replace the body of `performResolution()` below with your actual resolution
 * logic (e.g., calling an authorized API, a licensed data partner, or your
 * own media pipeline). The caller in routes/api.js expects:
 *
 *   Success:  { ok: true, title, quality, duration, outputUrl, thumbnail }
 *   Failure:  { ok: false, error: string }
 *
 * Do not implement protection-bypass, credential-stuffing, or scraping-evasion
 * logic here. This backend must only process content the operator is
 * authorized to handle.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * @param {string} url         The TeraBox share URL to resolve
 * @param {string} outputMode  'download' | 'stream'
 * @returns {Promise<import('../types.js').ResolveResult>}
 */
export async function resolveUrl(url, outputMode) {
  // ── Step 1: Supported host guard ──────────────────────────────────────────
  if (!isSupportedHost(url)) {
    return {
      ok: false,
      error: 'Unsupported domain. Only terabox.com, 1024terabox.com, and teraboxapp.com URLs are accepted.',
    };
  }

  // ── Step 2: Resolution attempt ────────────────────────────────────────────
  return performResolution(url, outputMode);
}

/**
 * Performs the actual resolution attempt.
 *
 * Currently returns a truthful failure because no lawful resolution integration
 * is configured. Replace this function body with a real implementation when
 * an authorized integration is available.
 *
 * @param {string} _url
 * @param {string} _outputMode
 * @returns {Promise<import('../types.js').ResolveResult>}
 */
async function performResolution(_url, _outputMode) {
  // No real integration is configured.
  // Do NOT replace this with fake metadata or fabricated URLs.
  return {
    ok: false,
    error: 'This backend is not configured for real source resolution. See README for integration instructions.',
  };
}
