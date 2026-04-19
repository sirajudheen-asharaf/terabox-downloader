import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Settings } from 'lucide-react';

interface SettingsPanelProps {
  outputMode: string;
  workerSlots: string;
  autoStart: boolean;
  saveHistory: boolean;
  onOutputModeChange: (value: string) => void;
  onWorkerSlotsChange: (value: string) => void;
  onAutoStartChange: (value: boolean) => void;
  onSaveHistoryChange: (value: boolean) => void;
}

export function SettingsPanel({
  outputMode,
  workerSlots,
  autoStart,
  saveHistory,
  onOutputModeChange,
  onWorkerSlotsChange,
  onAutoStartChange,
  onSaveHistoryChange,
}: SettingsPanelProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-violet-100">
          <Settings className="w-5 h-5 text-violet-700" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-600">Configure conversion options</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-800">Output Mode</Label>
          <Select value={outputMode} onValueChange={onOutputModeChange}>
            <SelectTrigger className="bg-white border-slate-200 text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="download">Download</SelectItem>
              <SelectItem value="stream">Stream</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-800">Worker Slots</Label>
          <Select value={workerSlots} onValueChange={onWorkerSlotsChange}>
            <SelectTrigger className="bg-white border-slate-200 text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="1">1 Worker</SelectItem>
              <SelectItem value="2">2 Workers</SelectItem>
              <SelectItem value="3">3 Workers</SelectItem>
              <SelectItem value="4">4 Workers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-800">Auto Start</Label>
              <p className="text-sm text-slate-500">Start conversion automatically</p>
            </div>
            <Switch
              checked={autoStart}
              onCheckedChange={onAutoStartChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-800">Save History</Label>
              <p className="text-sm text-slate-500">Keep conversion records</p>
            </div>
            <Switch
              checked={saveHistory}
              onCheckedChange={onSaveHistoryChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
