import { VideoData } from '../types';

const STORAGE_KEY = 'terabox_videos_v2';

function isVideoData(item: unknown): item is VideoData {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as VideoData).id === 'string' &&
    typeof (item as VideoData).sourceUrl === 'string' &&
    typeof (item as VideoData).outputUrl === 'string'
  );
}

export function getStoredVideos(): VideoData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isVideoData);
  } catch {
    return [];
  }
}

export function saveVideos(videos: VideoData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  } catch {
    // Storage quota exceeded or unavailable — silently ignore
  }
}

export function addVideo(video: VideoData): void {
  const existing = getStoredVideos();
  // Newest first; deduplicate by id
  const deduped = [video, ...existing.filter((v) => v.id !== video.id)];
  saveVideos(deduped);
}

export function deleteVideo(id: string): void {
  saveVideos(getStoredVideos().filter((v) => v.id !== id));
}

export function clearAllVideos(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function exportCsv(videos: VideoData[]): void {
  const header = 'Title,Quality,Duration,Source URL,Output URL,Resolved At';
  const rows = videos.map((v) =>
    [v.title, v.quality, v.duration, v.sourceUrl, v.outputUrl, v.fetchedAt]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(','),
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `terabox-results-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
