import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type OllamaStatus = {
  ollama_reachable: boolean;
  models: string[];
  default_model: string | null;
};

/** "Data stays on this machine" indicator for locally-served (Ollama) models. */
export function LocalModeIndicator() {
  return (
    <Badge
      data-testid="local-mode-indicator"
      className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 font-normal gap-1"
    >
      <ShieldCheck className="w-3 h-3" aria-hidden="true" />
      Local — data stays on this machine
    </Badge>
  );
}

/** Ollama connection readout for the setup wizard (detect + list + default). */
export function OllamaStatus() {
  const [status, setStatus] = useState<OllamaStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/llm/status')
      .then((data: OllamaStatus) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === null) return null;

  return (
    <div data-testid="ollama-status" className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
      {status.ollama_reachable ? (
        <>
          <p>
            Connected — {status.models.length} model
            {status.models.length === 1 ? '' : 's'} available
            {status.default_model ? ` (default: ${status.default_model})` : ''}
          </p>
          <LocalModeIndicator />
        </>
      ) : (
        <p>
          Ollama not reachable at {status.default_model === null ? 'this machine' : 'the configured URL'}.
          Start Ollama to use local models — no API keys needed.
        </p>
      )}
    </div>
  );
}
