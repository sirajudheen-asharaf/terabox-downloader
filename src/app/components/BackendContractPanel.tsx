import { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';

const REQUEST_EXAMPLE = `POST /api/resolve
Content-Type: application/json

{
  "url": "https://www.terabox.com/s/1abc...",
  "outputMode": "download"
}`;

const SUCCESS_EXAMPLE = `{
  "ok": true,
  "title": "Video title",
  "quality": "720p",
  "duration": "03:24",
  "outputUrl": "https://cdn.example.com/video.mp4",
  "thumbnail": "https://cdn.example.com/thumb.jpg"
}`;

const FAILURE_EXAMPLE = `{
  "ok": false,
  "error": "Human-readable reason"
}`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-slate-950/80 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre leading-relaxed">
      {code}
    </pre>
  );
}

export function BackendContractPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 overflow-hidden">
      <button
        id="backend-contract-toggle"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800">
            <Terminal className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Backend Contract</p>
            <p className="text-xs text-slate-500 mt-0.5">
              POST /api/resolve · <code className="text-slate-400">VITE_API_BASE_URL</code>
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-5 border-t border-white/5">
          <p className="pt-4 text-xs text-slate-400">
            This frontend calls{' '}
            <code className="px-1 rounded bg-slate-800 text-slate-300 font-mono">
              POST /api/resolve
            </code>{' '}
            for every queued URL. No resolution logic runs in the browser.
            Set{' '}
            <code className="px-1 rounded bg-slate-800 text-slate-300 font-mono">
              VITE_API_BASE_URL
            </code>{' '}
            in your{' '}
            <code className="px-1 rounded bg-slate-800 text-slate-300 font-mono">.env</code>{' '}
            to point at a non-origin backend; omit it to use same-origin routing.
          </p>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Request
            </p>
            <CodeBlock code={REQUEST_EXAMPLE} />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
              Success response
            </p>
            <CodeBlock code={SUCCESS_EXAMPLE} />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Failure response
            </p>
            <CodeBlock code={FAILURE_EXAMPLE} />
          </div>

          <div className="rounded-xl bg-slate-800/60 border border-white/5 px-4 py-3 text-xs text-slate-400 space-y-1">
            <p>
              <span className="text-slate-300 font-medium">Rows will fail truthfully</span>{' '}
              if the backend is not connected. No fake data is ever generated.
            </p>
            <p className="text-slate-500">
              Network errors, HTTP failures, malformed JSON, and explicit{' '}
              <code className="font-mono">ok: false</code> responses are all surfaced in the queue row.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
