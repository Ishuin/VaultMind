import { logFetch } from './logger';

let API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
if (!API_URL.endsWith('/api/v1')) {
  API_URL = API_URL.replace(/\/$/, '') + '/api/v1';
}

export const getAuthHeader = () => {
  const token = localStorage.getItem('thoughtweb-token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export class ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;

  constructor(message: string, status: number, code?: string, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

type ApiErrorBody = {
  detail?: unknown;
  message?: string;
};

const parseDetail = (data: ApiErrorBody): { message: string; code?: string } => {
  const detail = data?.detail;
  if (Array.isArray(detail)) {
    const messages = detail.map((err: { loc?: (string | number)[]; msg?: string }) => {
      const field = err.loc?.[err.loc.length - 1];
      return `${field}: ${err.msg ?? 'invalid'}`;
    });
    return { message: messages.join(', ') };
  }
  if (detail && typeof detail === 'object') {
    const obj = detail as { message?: string; code?: string };
    return { message: obj.message || JSON.stringify(detail), code: obj.code };
  }
  if (typeof detail === 'string') {
    return { message: detail };
  }
  return { message: data?.message || 'An unexpected error occurred' };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiFetch = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    ...options.headers,
    ...getAuthHeader(),
  };

  const started = performance.now();
  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError: unknown) {
    const durationMs = Math.round(performance.now() - started);
    const raw = networkError instanceof Error ? networkError.message : String(networkError);
    const message =
      raw === 'Failed to fetch'
        ? 'Could not connect to the backend server. Please ensure it is running.'
        : raw || 'Network request failed';
    logFetch({ method, endpoint, durationMs, ok: false, errorMessage: message });
    throw new ApiError(message, 0, 'network_error');
  }

  const durationMs = Math.round(performance.now() - started);
  const requestId = response.headers.get('X-Request-ID') ?? undefined;
  const data: ApiErrorBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    const { message, code } = parseDetail(data);
    logFetch({
      method,
      endpoint,
      status: response.status,
      durationMs,
      requestId,
      ok: false,
      errorMessage: message,
    });
    throw new ApiError(message, response.status, code, requestId);
  }

  logFetch({ method, endpoint, status: response.status, durationMs, requestId, ok: true });
  return data as T;
};
