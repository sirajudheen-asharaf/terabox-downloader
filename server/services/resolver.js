import { isSupportedHost } from '../config/hosts.js';
import { config } from '../config/index.js';

/**
 * Resolution service.
 *
 * Implements a lawful, public-only resolver that extracts metadata
 * exclusively from publicly accessible HTML responses — no cookies,
 * no internal APIs, no JS-state scraping, no auth bypass.
 *
 * Pipeline:
 *   1. Supported-host guard (rejects unknown domains instantly)
 *   2. Public HTTP fetch of the share page (timeout-guarded)
 *   3. HTML metadata extraction (Open Graph tags + <title> only)
 *   4. Normalization into the standard API response shape
 *   5. Truthful failure at every step that cannot produce real data
 *
 * outputUrl is always left empty — a direct download URL cannot be
 * lawfully obtained from the public HTML without authentication.
 *
 * @param {string} url        The TeraBox share URL to resolve
 * @param {string} outputMode 'download' | 'stream'
 * @returns {Promise<import('../types.js').ResolveResult>}
 */
export async function resolveUrl(url, outputMode) {
  // ── Step 1: Supported-host guard ──────────────────────────────────────────
  if (!isSupportedHost(url)) {
    return {
      ok: false,
      error: 'Unsupported domain. Only terabox.com, 1024terabox.com, and teraboxapp.com URLs are accepted.',
    };
  }

  // ── Step 2: Resolution attempt ────────────────────────────────────────────
  return performResolution(url, outputMode);
}

// ─── Internal implementation ──────────────────────────────────────────────────

const TIMEOUT_MS = config.RESOLVER_TIMEOUT_MS;

/**
 * Fetches the public share page and extracts openly visible metadata.
 *
 * Lawful constraints strictly observed:
 *   ✅ Standard HTTP GET, no cookies, no auth headers
 *   ✅ Reads only Open Graph / <title> tags from the HTML response
 *   ❌ Does not parse runtime JS state (window.__initialState__ etc.)
 *   ❌ Does not call internal/private TeraBox API endpoints
 *   ❌ Does not fabricate or assume any field values
 *
 * @param {string} url
 * @param {string} _outputMode
 * @returns {Promise<import('../types.js').ResolveResult>}
 */
async function performResolution(url, _outputMode) {
  // ── Fetch ──────────────────────────────────────────────────────────────────
  let html;
  try {
    html = await fetchPublicPage(url);
  } catch (err) {
    if (err.name === 'AbortError' || err.message === 'TIMEOUT') {
      console.warn('[resolver] Request timed out for:', url);
      return failure('Resolution timed out. The share link may be unavailable or slow to respond.');
    }
    console.warn('[resolver] Network error fetching share page:', err.message);
    return failure('Could not reach the share link. Please check the URL and try again.');
  }

  if (typeof html !== 'string') {
    // fetchPublicPage returns a failure object for non-200 / non-HTML
    return html;
  }

  // ── Parse ──────────────────────────────────────────────────────────────────
  const meta = extractPublicHtmlMetadata(html);

  // Require at least a meaningful title to declare success.
  // If the page returned only the generic shell ("TeraBox" etc., cleaned to ''),
  // we cannot truthfully claim resolution succeeded.
  if (!meta.title) {
    console.info('[resolver] No extractable public metadata for:', url);
    return failure('This link cannot be resolved by the current lawful resolver configuration.');
  }

  // ── Normalize ──────────────────────────────────────────────────────────────
  return {
    ok: true,
    title: meta.title,
    quality: '',       // not available from public HTML
    duration: '',      // not available from public HTML
    outputUrl: '',     // cannot be obtained lawfully without authentication
    thumbnail: meta.thumbnail,
  };
}

// ─── HTTP fetch ───────────────────────────────────────────────────────────────

/**
 * Fetches a URL as a plain public HTTP request and returns the HTML body.
 *
 * Returns:
 *   - HTML string on success
 *   - ResolveFailure object for expected upstream failures (4xx, non-HTML)
 *   - Throws for network errors and timeouts (caller handles)
 *
 * @param {string} url
 * @returns {Promise<string | import('../types.js').ResolveResult>}
 */
async function fetchPublicPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // Standard browser-like accept headers — no cookies, no auth
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        // Generic UA — identifies this as an automated resolver without spoofing
        'User-Agent': 'Mozilla/5.0 (compatible; TeraBoxResolver/1.0; public-access-only)',
      },
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    console.warn(`[resolver] Upstream HTTP ${response.status} for: ${url}`);
    const msg = response.status === 404
      ? 'The share link was not found. It may have been deleted or expired.'
      : response.status === 403
        ? 'This share link is not publicly accessible.'
        : 'This link cannot be resolved by the current lawful resolver configuration.';
    return failure(msg);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    console.warn(`[resolver] Unexpected content-type "${contentType}" for: ${url}`);
    return failure('This link cannot be resolved by the current lawful resolver configuration.');
  }

  return response.text();
}

// ─── HTML metadata extraction ─────────────────────────────────────────────────

/**
 * Extracts publicly visible metadata from HTML using only standard meta tags.
 *
 * Sources permitted:
 *   - <meta property="og:title">
 *   - <title> tag
 *   - <meta property="og:image">
 *
 * Sources explicitly NOT used:
 *   - window.__initialState__ or any embedded runtime JS variables
 *   - Internal API endpoint responses
 *   - Any data requiring session tokens or cookies
 *
 * @param {string} html
 * @returns {{ title: string; thumbnail: string; outputUrl: string }}
 */
function extractPublicHtmlMetadata(html) {
  return {
    title: extractTitle(html),
    thumbnail: extractMetaContent(html, 'og:image'),
    outputUrl: '',   // never populated — not available from public HTML
  };
}

/**
 * Returns the best available title, preferring og:title over <title>.
 * Strips generic platform suffixes that add no user value.
 *
 * @param {string} html
 * @returns {string}
 */
function extractTitle(html) {
  const ogTitle = extractMetaContent(html, 'og:title');
  if (ogTitle) return cleanTitle(ogTitle);

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch?.[1]) return cleanTitle(titleMatch[1].trim());

  return '';
}

/**
 * Extracts the content attribute of a <meta property="KEY"> or
 * <meta name="KEY"> tag. Handles both attribute orderings.
 *
 * @param {string} html
 * @param {string} key  e.g. 'og:title', 'og:image'
 * @returns {string}
 */
function extractMetaContent(html, key) {
  const escaped = escapeRegex(key);

  // property=KEY content=VALUE  (standard OGP order)
  const m1 = html.match(
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'),
  );
  if (m1) return m1[1].trim();

  // content=VALUE property=KEY  (reversed order — some platforms do this)
  const m2 = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["']`, 'i'),
  );
  if (m2) return m2[1].trim();

  // name=KEY content=VALUE  (non-OGP fallback)
  const m3 = html.match(
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'),
  );
  if (m3) return m3[1].trim();

  return '';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strips common platform-appended suffixes and normalises whitespace.
 * Returns '' if the result is a generic platform name with no file context.
 *
 * @param {string} raw
 * @returns {string}
 */
function cleanTitle(raw) {
  const stripped = raw
    .replace(/\s*[-|–—]\s*(TeraBox|1024TeraBox|TeraBoxApp)\s*$/i, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  // If what remains is literally just the brand name, it's not a file title
  if (/^(terabox|1024terabox|teraboxapp)$/i.test(stripped)) return '';

  return stripped;
}

/**
 * Escapes a string for safe use inside a RegExp.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Constructs a standard failure result.
 *
 * @param {string} error  User-safe error message
 * @returns {import('../types.js').ResolveResult}
 */
function failure(error) {
  return { ok: false, error };
}
