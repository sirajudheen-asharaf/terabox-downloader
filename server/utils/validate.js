const VALID_OUTPUT_MODES = ['download', 'stream'];

/**
 * Validates the body of a POST /api/resolve request.
 *
 * @param {unknown} body  The parsed JSON body from Express
 * @returns {{ valid: true } | { valid: false; status: number; error: string }}
 */
export function validateResolveRequest(body) {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, status: 400, error: 'Request body must be a JSON object.' };
  }

  const { url, outputMode } = /** @type {Record<string, unknown>} */ (body);

  // ── url ──────────────────────────────────────────────────────────────────
  if (url === undefined || url === null) {
    return { valid: false, status: 400, error: 'Missing required field: url.' };
  }
  if (typeof url !== 'string') {
    return { valid: false, status: 400, error: 'Field "url" must be a string.' };
  }
  if (url.trim().length === 0) {
    return { valid: false, status: 400, error: 'Field "url" must not be empty.' };
  }

  // ── url — basic URL parse ─────────────────────────────────────────────────
  try {
    new URL(url);
  } catch {
    return { valid: false, status: 400, error: 'Field "url" is not a valid URL.' };
  }

  // ── outputMode ───────────────────────────────────────────────────────────
  if (outputMode === undefined || outputMode === null) {
    return { valid: false, status: 400, error: 'Missing required field: outputMode.' };
  }
  if (!VALID_OUTPUT_MODES.includes(/** @type {string} */ (outputMode))) {
    return {
      valid: false,
      status: 400,
      error: `Field "outputMode" must be one of: ${VALID_OUTPUT_MODES.join(', ')}.`,
    };
  }

  return { valid: true };
}
