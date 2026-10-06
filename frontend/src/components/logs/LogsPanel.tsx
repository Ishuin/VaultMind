import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getLogs,
  subscribeLogs,
  clearLogs,
  downloadLogs,
  LogEntry,
  LogLevel,
} from '@/lib/logger';
import { apiFetch } from '@/lib/api';
import { RefreshCw, Download, Trash2, Server, Monitor } from 'lucide-react';

const LEVELS: Array<LogLevel | 'all'> = ['all', 'error', 'warn', 'network', 'info', 'session'];

const levelBadge = (level: string) => {
  switch (level) {
    case 'error':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'warn':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'network':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'session':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

interface ServerLogEntry {
  time?: string;
  level?: string;
  message?: string;
  request_id?: string;
  method?: string;
  path?: string;
  status_code?: number;
  duration_ms?: number;
}

export function LogsPanel() {
  const [level, setLevel] = useState<LogLevel | 'all'>('all');
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState<LogEntry[]>(() => getLogs());
  const [serverEntries, setServerEntries] = useState<ServerLogEntry[]>([]);
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setEntries(getLogs({ level, search }));
    update();
    return subscribeLogs(update);
  }, [level, search]);

  const loadServerLogs = async () => {
    setServerLoading(true);
    setServerError(null);
    try {
      const data = await apiFetch('/logs?limit=200');
      setServerEntries(data.entries || []);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setServerLoading(false);
    }
  };

  useEffect(() => {
    loadServerLogs();
  }, []);

  const counts = {
    error: entries.filter((e) => e.level === 'error').length,
    warn: entries.filter((e) => e.level === 'warn').length,
    network: entries.filter((e) => e.level === 'network').length,
    total: entries.length,
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: counts.total, tone: 'bg-midnight-navy/5 text-midnight-navy' },
          { label: 'Errors', value: counts.error, tone: 'bg-red-50 text-red-700' },
          { label: 'Warnings', value: counts.warn, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Network Calls', value: counts.network, tone: 'bg-sky-50 text-sky-700' },
        ].map((stat) => (
          <div key={stat.label} className={`p-4 rounded-xl border border-fog-border ${stat.tone}`}>
            <p className="text-sm opacity-70">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="client">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="client">
              <Monitor className="w-4 h-4 mr-2" /> Client
            </TabsTrigger>
            <TabsTrigger value="server">
              <Server className="w-4 h-4 mr-2" /> Server
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadLogs()} title="Export client logs as JSON">
              <Download className="w-4 h-4 mr-2" /> Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={loadServerLogs} disabled={serverLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${serverLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => { clearLogs(); setEntries(getLogs()); }}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear
            </Button>
          </div>
        </div>

        <TabsContent value="client" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize border transition-colors ${
                    level === l
                      ? 'bg-midnight-navy text-white border-midnight-navy'
                      : 'bg-white text-slate-ink border-fog-border hover:border-midnight-navy/40'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <Input
              placeholder="Filter logs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs h-8"
            />
          </div>

          <div className="bg-white border border-fog-border rounded-xl divide-y divide-fog-border max-h-[520px] overflow-y-auto">
            {entries.length === 0 && (
              <p className="p-6 text-sm text-slate-ink text-center">No log entries yet.</p>
            )}
            {entries.map((entry) => (
              <div key={entry.id} className="p-3 flex items-start gap-3 text-sm">
                <span className="text-slate-ink/60 whitespace-nowrap font-mono text-xs">
                  {new Date(entry.ts).toLocaleTimeString()}
                </span>
                <Badge variant="outline" className={`text-xs capitalize ${levelBadge(entry.level)}`}>
                  {entry.level}
                </Badge>
                <span className="text-slate-ink/60 text-xs min-w-[70px]">{entry.source}</span>
                <span className="text-midnight-navy flex-1 break-all">{entry.message}</span>
                {entry.requestId && (
                  <span className="text-slate-ink/50 text-xs font-mono">rid:{entry.requestId.slice(0, 8)}</span>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="server" className="space-y-4">
          {serverError && (
            <p className="text-sm text-red-600">Failed to load server logs: {serverError}</p>
          )}
          <div className="bg-white border border-fog-border rounded-xl divide-y divide-fog-border max-h-[520px] overflow-y-auto">
            {serverEntries.length === 0 && !serverLoading && (
              <p className="p-6 text-sm text-slate-ink text-center">
                No server log entries yet. Make some requests first.
              </p>
            )}
            {serverEntries.map((entry, index) => (
              <div key={index} className="p-3 flex items-start gap-3 text-sm">
                <span className="text-slate-ink/60 whitespace-nowrap font-mono text-xs">
                  {entry.time ? new Date(entry.time).toLocaleTimeString() : '--:--:--'}
                </span>
                <Badge variant="outline" className={`text-xs capitalize ${levelBadge((entry.level || 'info').toLowerCase())}`}>
                  {entry.level || 'INFO'}
                </Badge>
                <span className="text-midnight-navy flex-1 break-all">
                  {entry.method && entry.path ? `${entry.method} ${entry.path} — ` : ''}
                  {entry.message}
                </span>
                {typeof entry.status_code === 'number' && (
                  <span className={`font-mono text-xs ${entry.status_code >= 400 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {entry.status_code}
                  </span>
                )}
                {typeof entry.duration_ms === 'number' && (
                  <span className="text-slate-ink/50 text-xs font-mono">{entry.duration_ms}ms</span>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LogsPanel;
