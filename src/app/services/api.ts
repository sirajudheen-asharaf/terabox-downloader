import { ResolveResponse, VideoData } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const RESOLVE_ENDPOINT = `${API_BASE}/api/resolve`;

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Calls POST /api/resolve and returns a VideoData on success.
 * Throws a descriptive Error or ApiError on every failure path.
 *
 * No fake data is ever generated here. If the backend is absent
 * or returns a failure, an exception is thrown.
 */
export async function resolveTeraBoxUrl(
  url: string,
  signal?: AbortSignal,
): Promise<VideoData> {
  let response: Response;

  try {
    response = await fetch(RESOLVE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, outputMode: 'download' }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request was canceled.');
    }
    // Network-level failure – backend unreachable
    throw new Error(
      'Resolution service is unavailable. Connect the /api/resolve backend.',
    );
  }

  // HTTP-level errors
  if (!response.ok) {
    let serverMessage: string | undefined;
    try {
      const body = await response.json();
      serverMessage = typeof body?.error === 'string' ? body.error : undefined;
    } catch {
      // non-JSON error body – ignore
    }

    if (response.status === 404) {
      throw new ApiError(
        404,
        serverMessage ?? 'Resolution service not found. Ensure /api/resolve is mounted.',
      );
    }
    if (response.status === 502 || response.status === 503) {
      throw new ApiError(
        response.status,
        serverMessage ?? 'Backend gateway is unavailable.',
      );
    }
    throw new ApiError(
      response.status,
      serverMessage ?? `Backend returned HTTP ${response.status}.`,
    );
  }

  // Parse JSON body
  let data: ResolveResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error('Malformed response from /api/resolve — expected JSON.');
  }

  // Validate shape
  if (typeof data !== 'object' || data === null || typeof data.ok !== 'boolean') {
    throw new Error('Malformed response from /api/resolve — missing "ok" field.');
  }

  // Backend-level failure
  if (!data.ok) {
    throw new ApiError(400, data.error || 'Backend reported resolution failure.');
  }

  // Validate required success fields
  if (!data.outputUrl) {
    throw new Error(
      'Backend response is missing "outputUrl" — resolution incomplete.',
    );
  }

  return {
    id: crypto.randomUUID(),
    sourceUrl: url,
    title: data.title || 'Untitled',
    quality: data.quality || 'Unknown',
    duration: data.duration || '--:--',
    outputUrl: data.outputUrl,
    thumbnailUrl: data.thumbnail || '',
    fetchedAt: new Date().toISOString(),
  };
}
