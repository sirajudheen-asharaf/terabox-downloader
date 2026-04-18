/**
 * Supported TeraBox-family host patterns.
 * Add new entries here to extend validation without touching route code.
 *
 * Each entry is a plain hostname string (no scheme, no path).
 */
export const SUPPORTED_HOSTS = [
  'terabox.com',
  'www.terabox.com',
  '1024terabox.com',
  'www.1024terabox.com',
  'teraboxapp.com',
  'www.teraboxapp.com',
];

/**
 * Returns true if the given raw URL string belongs to a supported TeraBox host.
 * Returns false for any malformed, non-HTTP, or unsupported URL.
 *
 * @param {string} rawUrl
 * @returns {boolean}
 */
export function isSupportedHost(rawUrl) {
  try {
    const { protocol, hostname } = new URL(rawUrl);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    return SUPPORTED_HOSTS.includes(hostname.toLowerCase());
  } catch {
    return false;
  }
}
