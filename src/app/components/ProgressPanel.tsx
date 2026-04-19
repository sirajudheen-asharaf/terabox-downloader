import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Clock, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';

interface ProgressPanelProps {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  progress: number;
}

export function ProgressPanel({ queued, processing, completed, failed, progress }: ProgressPanelProps) {
  const metrics = [
    { label: 'Queued', value: queued, icon: Clock, color: 'text-slate-500' },
    { label: 'Processing', value: processing, icon: PlayCircle, color: 'text-cyan-600' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Failed', value: failed, icon: XCircle, color: 'text-red-600' },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-600">Overall Progress</h3>
          <span className="text-sm font-semibold text-slate-900">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className="text-sm text-slate-600">{metric.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
