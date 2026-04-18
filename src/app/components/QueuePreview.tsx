import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Link2, Loader2, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { QueueRow, QueueStatus } from '../types';

interface QueuePreviewProps {
  items: QueueRow[];
}

const STATUS_CONFIG: Record<
  QueueStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    className: 'border-slate-500/50 text-slate-400',
    icon: null,
  },
  processing: {
    label: 'Processing',
    className: 'border-cyan-500/50 text-cyan-400',
    icon: <Loader2 className="w-3 h-3 animate-spin mr-1 inline" />,
  },
  success: {
    label: 'Done',
    className: 'border-emerald-500/50 text-emerald-400',
    icon: <CheckCircle2 className="w-3 h-3 mr-1 inline" />,
  },
  failed: {
    label: 'Failed',
    className: 'border-red-500/50 text-red-400',
    icon: <XCircle className="w-3 h-3 mr-1 inline" />,
  },
  canceled: {
    label: 'Canceled',
    className: 'border-orange-500/50 text-orange-400',
    icon: <Ban className="w-3 h-3 mr-1 inline" />,
  },
};

export function QueuePreview({ items }: QueuePreviewProps) {
  return (
    <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-cyan-500/10">
          <Link2 className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Queue</h2>
          <p className="text-sm text-slate-400">
            {items.length === 0
              ? 'No links queued'
              : `${items.length} link${items.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-[200px]">
        <div className="space-y-2 pr-2">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No links in queue</p>
              <p className="text-sm text-slate-600 mt-1">
                Add links using the input panel
              </p>
            </div>
          ) : (
            items.map((item, index) => {
              const cfg = STATUS_CONFIG[item.status];
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <Badge
                    variant="outline"
                    className="shrink-0 border-violet-500/50 text-violet-400 mt-0.5"
                  >
                    #{index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{item.url}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Badge variant="outline" className={`text-xs ${cfg.className}`}>
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                      {item.error && (
                        <p className="text-xs text-red-400 truncate" title={item.error}>
                          — {item.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
