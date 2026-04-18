import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  gradient: string;
}

export function StatsCard({ title, value, icon: Icon, trend, gradient }: StatsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-violet-500/10">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <span className="text-xs text-emerald-400">{trend}</span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-slate-400">{title}</p>
        </div>
      </div>
    </div>
  );
}
