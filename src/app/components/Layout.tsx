import { Outlet } from 'react-router';
import { Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

type HealthStatus = 'checking' | 'connected' | 'unavailable';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

function BackendHealthPill() {
  const [status, setStatus] = useState<HealthStatus>('checking');

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000),
        });
        if (!cancelled) {
          setStatus(res.ok ? 'connected' : 'unavailable');
        }
      } catch {
        if (!cancelled) setStatus('unavailable');
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-white/10 text-xs text-slate-400">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Checking backend…
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Backend connected
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs text-red-400">
      <span className="w-2 h-2 rounded-full bg-red-500" />
      Backend unavailable
    </div>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-violet-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                  TeraBox Downloader
                </h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                  Requires /api/resolve backend
                </p>
              </div>
            </div>

            {/* Live backend health pill */}
            <BackendHealthPill />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
