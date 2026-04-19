import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Database, CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

import { BulkInputPanel } from '../components/BulkInputPanel';
import { QueuePreview } from '../components/QueuePreview';
import { ResultsTable } from '../components/ResultsTable';
import { StatsCard } from '../components/StatsCard';
import { VideoPreviewModal } from '../components/VideoPreviewModal';
import { BackendContractPanel } from '../components/BackendContractPanel';

import { QueueRow, VideoData } from '../types';
import { extractTeraBoxUrls } from '../utils/teraboxParser';
import { getStoredVideos, addVideo, deleteVideo, clearAllVideos } from '../utils/storage';
import { resolveTeraBoxUrl, ApiError } from '../services/api';

// A backend-unavailable banner shown when the service is confirmed down.
function BackendBanner() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">
      <WifiOff className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium text-red-800">Resolution service is unavailable</p>
        <p className="text-red-700/80 mt-0.5">
          This app sends links to a backend service. If it's unavailable, you'll see an error.
        </p>
      </div>
    </div>
  );
}

export function HomePage() {
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [results, setResults] = useState<VideoData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backendDown, setBackendDown] = useState(false);

  const [previewVideo, setPreviewVideo] = useState<
    { title: string; duration: string; quality: string; url: string } | undefined
  >();
  const [previewOpen, setPreviewOpen] = useState(false);

  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Load persisted results on mount
  useEffect(() => {
    setResults(getStoredVideos());
  }, []);

  // Abort all in-flight requests on unmount
  useEffect(() => {
    return () => {
      abortControllers.current.forEach((c) => c.abort());
    };
  }, []);

  // ─── Queue management ──────────────────────────────────────────────────────

  const handlePrepareQueue = useCallback((links: string[]) => {
    const extracted = links.flatMap((link) => extractTeraBoxUrls(link));
    if (extracted.length === 0) {
      toast.error('No valid TeraBox URLs detected.');
      return;
    }
    const newItems: QueueRow[] = extracted.map((url) => ({
      id: crypto.randomUUID(),
      url,
      status: 'pending',
    }));
    setQueue((prev) => [...prev, ...newItems]);
    toast.success(`${newItems.length} link${newItems.length === 1 ? '' : 's'} added to queue.`);
  }, []);

  const handleStartConversion = useCallback(async () => {
    const pending = queue.filter(
      (item) => item.status === 'pending' || item.status === 'failed',
    );
    if (pending.length === 0) {
      toast.info('No pending or failed items to process.');
      return;
    }

    setIsProcessing(true);
    setBackendDown(false);

    for (const item of pending) {
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'processing', error: undefined } : q)),
      );

      const controller = new AbortController();
      abortControllers.current.set(item.id, controller);

      try {
        const video = await resolveTeraBoxUrl(item.url, controller.signal);

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: 'success', videoData: video } : q,
          ),
        );

        addVideo(video);
        setResults(getStoredVideos());
        toast.success(`Resolved: "${video.title}"`);

      } catch (error) {
        const isCanceled =
          error instanceof Error && error.message.includes('canceled');
        const isNetworkError =
          error instanceof Error &&
          error.message.includes('Resolution service is unavailable');
        const isGatewayError =
          error instanceof ApiError &&
          (error.statusCode === 502 || error.statusCode === 503);

        const message = error instanceof Error ? error.message : 'Unknown error';

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: isCanceled ? 'canceled' : 'failed', error: message }
              : q,
          ),
        );

        if (isNetworkError || isGatewayError) {
          setBackendDown(true);
          toast.error('Resolution service is unavailable — stopping queue.');
          break;
        }

        if (!isCanceled) {
          toast.error(`Failed: ${message}`);
        }
      } finally {
        abortControllers.current.delete(item.id);
      }
    }

    setIsProcessing(false);
  }, [queue]);

  const handleRetryFailed = useCallback(() => {
    setQueue((prev) =>
      prev.map((q) =>
        q.status === 'failed' ? { ...q, status: 'pending', error: undefined } : q,
      ),
    );
    toast.info('Failed items re-queued. Click Start Conversion to process.');
  }, []);

  const handleClearAll = useCallback(() => {
    if (!confirm('Clear the entire current queue?')) return;
    abortControllers.current.forEach((c) => c.abort());
    setQueue([]);
  }, []);

  // ─── Results actions ───────────────────────────────────────────────────────

  const handlePreview = useCallback((video: VideoData) => {
    if (!video.outputUrl) {
      toast.error('No output URL available for preview.');
      return;
    }
    setPreviewVideo({
      title: video.title,
      duration: video.duration,
      quality: video.quality,
      url: video.outputUrl,
    });
    setPreviewOpen(true);
  }, []);

  const handleCopy = useCallback((url: string) => {
    if (!url) { toast.error('No URL to copy.'); return; }
    navigator.clipboard.writeText(url);
    toast.success('Download URL copied to clipboard');
  }, []);

  const handleDownload = useCallback((url: string, title: string) => {
    if (!url) { toast.error('No download URL available.'); return; }
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading "${title}"`);
  }, []);

  const handleDeleteResult = useCallback((id: string) => {
    deleteVideo(id);
    setResults(getStoredVideos());
    toast.success('Record removed');
  }, []);

  const handleClearResults = useCallback(() => {
    if (!confirm('Clear all saved results?')) return;
    clearAllVideos();
    setResults([]);
    toast.success('All results cleared');
  }, []);

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(
    () => ({
      total: queue.length,
      success: queue.filter((q) => q.status === 'success').length,
      failed: queue.filter((q) => q.status === 'failed').length,
    }),
    [queue],
  );

  return (
    <div className="space-y-6">
      <Toaster theme="light" richColors />

      {/* Backend unavailable banner */}
      {backendDown && <BackendBanner />}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total in Queue"
          value={stats.total}
          icon={Database}
          gradient="from-violet-500 to-purple-500"
        />
        <StatsCard
          title="Resolved"
          value={stats.success}
          icon={CheckCircle2}
          gradient="from-emerald-500 to-teal-500"
          trend={stats.success > 0 ? `+${stats.success}` : undefined}
        />
        <StatsCard
          title="Failed"
          value={stats.failed}
          icon={AlertCircle}
          gradient="from-red-500 to-orange-500"
        />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <BulkInputPanel
            isProcessing={isProcessing}
            onPrepareQueue={handlePrepareQueue}
            onStartConversion={handleStartConversion}
            onRetryFailed={handleRetryFailed}
            onClearAll={handleClearAll}
          />
        </div>
        <div className="lg:col-span-7">
          <QueuePreview items={queue} />
        </div>
      </div>

      {/* Backend contract reference */}
      <BackendContractPanel />

      {/* Results table */}
      <div className="pt-2">
        <ResultsTable
          results={results}
          onPreview={handlePreview}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onDelete={handleDeleteResult}
        />
        {results.length > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              id="clear-results-btn"
              onClick={handleClearResults}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear all results
            </button>
          </div>
        )}
      </div>

      {/* Preview modal */}
      <VideoPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        videoData={previewVideo}
        onCopy={handleCopy}
        onDownload={handleDownload}
      />
    </div>
  );
}
