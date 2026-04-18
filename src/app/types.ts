// ─── API Contract ────────────────────────────────────────────────────────────

export interface ResolveRequest {
  url: string;
  outputMode: 'download' | 'stream';
}

export interface ResolveSuccess {
  ok: true;
  title: string;
  quality: string;
  duration: string;
  outputUrl: string;
  thumbnail: string;
}

export interface ResolveFailure {
  ok: false;
  error: string;
}

export type ResolveResponse = ResolveSuccess | ResolveFailure;

// ─── Domain Types ────────────────────────────────────────────────────────────

export interface VideoData {
  id: string;
  sourceUrl: string;
  title: string;
  quality: string;
  duration: string;
  outputUrl: string;
  thumbnailUrl: string;
  fetchedAt: string;
}

export type QueueStatus = 'pending' | 'processing' | 'success' | 'failed' | 'canceled';

export interface QueueRow {
  id: string;
  url: string;
  status: QueueStatus;
  error?: string;
  videoData?: VideoData;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  outputMode: 'download' | 'stream';
  concurrency: number;
  saveHistory: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  outputMode: 'download',
  concurrency: 1,
  saveHistory: true,
};

// ─── Fetch State ─────────────────────────────────────────────────────────────

export type FetchPhase = 'idle' | 'running' | 'done';

export interface FetchState {
  phase: FetchPhase;
  processed: number;
  total: number;
}
