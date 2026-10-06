export type LogLevel = 'info' | 'warn' | 'error' | 'network' | 'session';

export interface LogEntry {
  id: number;
  ts: string;
  level: LogLevel;
  source: string;
  message: string;
  method?: string;
  endpoint?: string;
  status?: number;
  durationMs?: number;
  requestId?: string;
  provider?: string;
  stack?: string;
}

const MAX_ENTRIES = 500;

let entries: LogEntry[] = [];
let seq = 0;
const listeners = new Set<() => void>();

const SENSITIVE_KEYS = /(authorization|api[-_]?key|x-[a-z-]*api-key|password|token|secret)/gi;

export const redact = (value: string): string =>
  value
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, '$1***')
    .replace(/\b(sk|pk|rk)-[A-Za-z0-9_-]{6,}/g, (m) => `${m.slice(0, 3)}...${m.slice(-4)}`)
    .replace(new RegExp(`("?${SENSITIVE_KEYS.source}"?\\s*[:=]\\s*)("[^"]*"|'[^']*'|[^,\\s}\\]]+)`, 'gi'), '$1***');

function push(entry: Omit<LogEntry, 'id' | 'ts'>): LogEntry {
  const full: LogEntry = {
    ...entry,
    message: redact(entry.message),
    id: ++seq,
    ts: new Date().toISOString(),
  };
  entries = [...entries, full].slice(-MAX_ENTRIES);
  listeners.forEach((fn) => fn());
  return full;
}

export const log = (level: LogLevel, source: string, message: string, extra: Partial<LogEntry> = {}) =>
  push({ level, source, message, ...extra });

export const logError = (source: string, message: string, extra: Partial<LogEntry> = {}) =>
  push({ level: 'error', source, message, ...extra });

export interface FetchLogInput {
  method: string;
  endpoint: string;
  status?: number;
  durationMs: number;
  requestId?: string;
  ok: boolean;
  errorMessage?: string;
}

export const logFetch = ({ method, endpoint, status, durationMs, requestId, ok, errorMessage }: FetchLogInput) => {
  const level: LogLevel = ok ? 'network' : 'error';
  const message = ok
    ? `${method} ${endpoint} -> ${status} (${durationMs}ms)`
    : `${method} ${endpoint} -> ${status ?? 'NETWORK_ERROR'} failed: ${errorMessage ?? 'unknown'} (${durationMs}ms)`;
  push({ level, source: 'api', message, method, endpoint, status, durationMs, requestId, errorMessage });
};

export const getLogs = (filter?: { level?: LogLevel | 'all'; search?: string }): LogEntry[] => {
  let result = entries;
  if (filter?.level && filter.level !== 'all') {
    result = result.filter((e) => e.level === filter.level);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.message.toLowerCase().includes(q) ||
        (e.endpoint ?? '').toLowerCase().includes(q) ||
        (e.source ?? '').toLowerCase().includes(q)
    );
  }
  return [...result].reverse();
};

export const clearLogs = () => {
  entries = [];
  listeners.forEach((fn) => fn());
};

export const subscribeLogs = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const exportLogs = (): string =>
  JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: entries.length,
      entries,
    },
    null,
    2
  );

export const downloadLogs = () => {
  const blob = new Blob([exportLogs()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `thoughtweb-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const installGlobalHandlers = () => {
  window.addEventListener('error', (event) => {
    logError('window.error', event.message, {
      stack: event.error?.stack,
      endpoint: `${event.filename ?? ''}:${event.lineno ?? 0}`,
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    logError(
      'unhandledrejection',
      reason instanceof Error ? reason.message : String(reason),
      { stack: reason instanceof Error ? reason.stack : undefined }
    );
  });
};
