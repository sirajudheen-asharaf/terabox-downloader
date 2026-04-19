import { useRef, useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import {
  AlertTriangle,
  FileUp,
  Play,
  RotateCcw,
  Trash2,
  Database,
  Loader2,
} from 'lucide-react';
import { processFile } from '../utils/teraboxParser';
import { toast } from 'sonner';

interface BulkInputPanelProps {
  isProcessing: boolean;
  onPrepareQueue: (links: string[]) => void;
  onStartConversion: () => void;
  onRetryFailed: () => void;
  onClearAll: () => void;
}

export function BulkInputPanel({
  isProcessing,
  onPrepareQueue,
  onStartConversion,
  onRetryFailed,
  onClearAll,
}: BulkInputPanelProps) {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrepare = () => {
    const links = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    onPrepareQueue(links);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const urls = await processFile(file);
      onPrepareQueue(urls);
      toast.success(`Extracted ${urls.length} links from "${file.name}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to read file');
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-violet-100">
          <Database className="w-5 h-5 text-violet-700" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Paste your links</h2>
          <p className="text-sm text-slate-600">Paste links or upload a file</p>
        </div>
      </div>

      <Textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={
          'https://terabox.com/s/1abc...\nhttps://terabox.com/s/2def...\n\nOne link per line'
        }
        className="min-h-[180px] mb-3 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 resize-none disabled:opacity-50"
      />

      {/* File upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.json,.html,.htm"
        className="hidden"
        onChange={handleFileUpload}
        id="bulk-file-upload"
      />
      <button
        type="button"
        disabled={isProcessing}
        onClick={() => fileInputRef.current?.click()}
        className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-2.5 text-sm text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FileUp className="w-4 h-4" />
        Upload .txt / .json / .html export
      </button>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Backend required</p>
            <p className="text-amber-700/80">
              This app sends links to a backend service. If it's unavailable, you'll see an error.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          id="prepare-queue-btn"
          onClick={handlePrepare}
          disabled={isProcessing || !inputText.trim()}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 disabled:opacity-50"
        >
          <Database className="w-4 h-4 mr-2" />
          Prepare Queue
        </Button>
        <Button
          id="start-conversion-btn"
          onClick={onStartConversion}
          disabled={isProcessing}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isProcessing ? 'Processing…' : 'Start Conversion'}
        </Button>
        <Button
          id="retry-failed-btn"
          onClick={onRetryFailed}
          disabled={isProcessing}
          variant="outline"
          className="bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry Failed
        </Button>
        <Button
          id="clear-queue-btn"
          onClick={onClearAll}
          disabled={isProcessing}
          variant="outline"
          className="bg-white border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Queue
        </Button>
      </div>
    </div>
  );
}
