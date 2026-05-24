import { environment } from '../../environments/environment';

type ClientErrorSource = 'window.error' | 'unhandledrejection' | 'console.error';

interface ClientErrorPayload {
  source: ClientErrorSource;
  message: string;
  stack?: string;
  pageUrl: string;
  userAgent: string;
  timestamp: string;
  line?: number;
  column?: number;
  extra?: unknown;
}

function safeSerialize(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function postClientError(payload: ClientErrorPayload): void {
  if (!environment.apiUrl || environment.useMockApi) {
    return;
  }

  const endpoint = `${environment.apiUrl.replace(/\/+$/, '')}/api/client-errors`;
  const body = JSON.stringify(payload);

  try {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Swallow logging transport errors to avoid feedback loops.
    });
  } catch {
    // Swallow logging transport errors to avoid feedback loops.
  }
}

export function initClientErrorLogger(): void {
  const scope = window as typeof window & { __CLIENT_ERROR_LOGGER_INIT__?: boolean };

  if (scope.__CLIENT_ERROR_LOGGER_INIT__) {
    return;
  }
  scope.__CLIENT_ERROR_LOGGER_INIT__ = true;

  window.addEventListener('error', (event: ErrorEvent) => {
    postClientError({
      source: 'window.error',
      message: event.message || 'Unknown window error',
      stack: event.error?.stack,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      line: event.lineno,
      column: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    postClientError({
      source: 'unhandledrejection',
      message: reason?.message ? String(reason.message) : safeSerialize(reason),
      stack: reason?.stack ? String(reason.stack) : undefined,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      extra: reason,
    });
  });

  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    postClientError({
      source: 'console.error',
      message: args.map((item) => safeSerialize(item)).join(' | ').slice(0, 4000),
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    originalConsoleError(...args);
  };
}
