import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Eye, Copy, Download, Trash2, CheckCircle, FileDown, Search, X } from 'lucide-react';
import { VideoData } from '../types';
import { exportCsv } from '../utils/storage';

interface ResultsTableProps {
  results: VideoData[];
  onPreview: (video: VideoData) => void;
  onCopy: (url: string) => void;
  onDownload: (url: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function ResultsTable({
  results,
  onPreview,
  onCopy,
  onDownload,
  onDelete,
}: ResultsTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.sourceUrl.toLowerCase().includes(q) ||
        r.quality.toLowerCase().includes(q),
    );
  }, [results, search]);

  return (
    <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">Resolution Results</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {results.length} resolved · {filtered.length} shown
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search results…"
            className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* CSV Export */}
        {results.length > 0 && (
          <Button
            id="export-csv-btn"
            size="sm"
            variant="outline"
            onClick={() => exportCsv(results)}
            className="border-white/10 text-slate-300 hover:bg-white/10 shrink-0"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-slate-400">Source</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Title</TableHead>
              <TableHead className="text-slate-400">Quality</TableHead>
              <TableHead className="text-slate-400">Duration</TableHead>
              <TableHead className="text-slate-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-14 text-slate-500">
                  {results.length === 0 ? (
                    <div className="space-y-2">
                      <p>No results yet.</p>
                      <p className="text-sm text-slate-600">
                        Add links, then click <span className="text-slate-400">Start Conversion</span> — results will appear here once the backend resolves them.
                      </p>
                    </div>
                  ) : (
                    <p>No results match "{search}".</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((result) => (
                <TableRow key={result.id} className="border-white/5 hover:bg-white/5">
                  <TableCell
                    className="font-mono text-xs text-slate-400 max-w-[180px] truncate"
                    title={result.sourceUrl}
                  >
                    {result.sourceUrl}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolved
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-white max-w-[200px] truncate"
                    title={result.title}
                  >
                    {result.title}
                  </TableCell>
                  <TableCell className="text-slate-300">{result.quality}</TableCell>
                  <TableCell className="text-slate-300">{result.duration}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview — only when outputUrl present */}
                      {result.outputUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          id={`preview-${result.id}`}
                          onClick={() => onPreview(result)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                          title="Preview video"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        id={`copy-${result.id}`}
                        onClick={() => onCopy(result.outputUrl)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                        title="Copy direct link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        id={`download-${result.id}`}
                        onClick={() => onDownload(result.outputUrl, result.title)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        id={`delete-${result.id}`}
                        onClick={() => onDelete(result.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        title="Remove record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
