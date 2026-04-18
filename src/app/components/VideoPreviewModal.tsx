import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Download, Copy, Clock, Video } from 'lucide-react';

interface VideoPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoData?: {
    title: string;
    duration: string;
    quality: string;
    url: string;
  };
  onCopy?: (url: string) => void;
  onDownload?: (url: string, title: string) => void;
}

export function VideoPreviewModal({
  open,
  onOpenChange,
  videoData,
  onCopy,
  onDownload,
}: VideoPreviewModalProps) {
  if (!videoData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl truncate pr-8">{videoData.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-white/10">
            {videoData.url ? (
              <video controls className="w-full h-full" src={videoData.url}>
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                No preview URL available
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/50 border border-white/10">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Clock className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Duration</p>
                <p className="font-medium">{videoData.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/50 border border-white/10">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Video className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Quality</p>
                <p className="font-medium">{videoData.quality}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              id="modal-download-btn"
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
              onClick={() => onDownload?.(videoData.url, videoData.title)}
              disabled={!videoData.url}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Video
            </Button>
            <Button
              id="modal-copy-btn"
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/10"
              onClick={() => onCopy?.(videoData.url)}
              disabled={!videoData.url}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
