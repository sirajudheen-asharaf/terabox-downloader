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
    className: 'border-slate-200 bg-slate-50 text-slate-600',
    icon: null,
  },
  processing: {
    label: 'Processing',
    className: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    icon: <Loader2 className="w-3 h-3 animate-spin mr-1 inline" />,
  },
  success: {
    label: 'Done',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: <CheckCircle2 className="w-3 h-3 mr-1 inline" />,
  },
  failed: {
    label: 'Failed',
    className: 'border-red-200 bg-red-50 text-red-700',
    icon: <XCircle className="w-3 h-3 mr-1 inline" />,
  },
  canceled: {
    label: 'Canceled',
    className: 'border-orange-200 bg-orange-50 text-orange-700',
    icon: <Ban className="w-3 h-3 mr-1 inline" />,
  },
};

export function QueuePreview({ items }: QueuePreviewProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-cyan-100">
          <Link2 className="w-5 h-5 text-cyan-700" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Queue preview</h2>
          <p className="text-sm text-slate-600">
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
              <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No links in queue</p>
              <p className="text-sm text-slate-400 mt-1">
                Add links using the input panel
              </p>
            </div>
          ) : (
            items.map((item, index) => {
              const cfg = STATUS_CONFIG[item.status];
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <Badge
                    variant="outline"
                    className="shrink-0 border-violet-200 bg-violet-50 text-violet-700 mt-0.5"
                  >
                    #{index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{item.url}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Badge variant="outline" className={`text-xs ${cfg.className}`}>
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                      {item.error && (
                        <p className="text-xs text-red-600 truncate" title={item.error}>
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
