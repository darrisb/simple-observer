import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

type LogType = 'errors' | 'network' | 'all';

interface WordPressErrorRow {
  id?: number | string;
  _id?: string;
  message?: string;
  file?: string;
  time?: string;
  line?: number | string;
  level?: string;
  ai_explanation?: string;
}

interface WordPressNetworkRow {
  id?: number | string;
  _id?: string;
  direction?: string;
  url?: string;
  method?: string;
  status_code?: number | string;
  ip_address?: string;
  memory_usage?: string;
  time?: string;
}

interface WordPressLogsResponse {
  success?: boolean;
  data?: {
    errors?: WordPressErrorRow[];
    network?: WordPressNetworkRow[];
  };
}

export interface RuntimeErrorLog {
  _id: string;
  message: string;
  file: string;
  time: string;
  line: number;
  level: string;
  ai_explanation?: string;
}

export interface RuntimeNetworkLog {
  _id: string;
  direction: string;
  url: string;
  method: string;
  status_code: string;
  ip_address: string;
  memory_usage: string;
  time: string;
}

export interface RuntimeLogPayload {
  errors: RuntimeErrorLog[];
  network: RuntimeNetworkLog[];
}

@Injectable({
  providedIn: 'root',
})
export class ReportAnalysisService {
  // Prefer the current prefixed config, fall back to legacy config key.
  wpConfig = (window as any).MYOBRM_CONFIG ?? (window as any).AI_CONFIG;

  constructor(private apiService: ApiService) {}

  // 1. Fetching Logs
  getRuntimeLogs(logType: LogType = 'all', limit: number = 500) {
    const action = this.wpConfig?.actions?.getLogs ?? 'myobrm_get_logs';
    const nonce = this.wpConfig?.nonce;
    const ajaxUrl = this.wpConfig?.ajaxUrl || this.wpConfig?.apiUrl || 'wp-admin/admin-ajax.php';

    // In real mode, WP config must provide a callable AJAX URL.
    if (!environment.useMockApi && !this.wpConfig?.ajaxUrl && !this.wpConfig?.apiUrl) {
      return of<RuntimeLogPayload>({ errors: [], network: [] });
    }

    const formData = new FormData();
    formData.append('action', action);
    if (nonce) {
      formData.append('nonce', nonce);
    }
    formData.append('log_type', logType);
    formData.append('limit', String(limit));

    return this.apiService.post<WordPressLogsResponse>(ajaxUrl, formData).pipe(
      map((response) => ({
        errors: this.normalizeErrors(response?.data?.errors ?? []),
        network: this.normalizeNetwork(response?.data?.network ?? []),
      })),
      catchError(() => of<RuntimeLogPayload>({ errors: [], network: [] }))
    );
  }

  getReportAnalysisFromApi() {
    return this.getRuntimeLogs('errors').pipe(
      map((payload) => ({
        errors: payload.errors,
      }))
    );
  }

  // 2. Getting AI Explanations
  getFixSuggestionFromApi(id: string) {
    return this.apiService.get(`api/dashboard/explain/${id}`);
  }

  // 3. Identity Sync logic
  checkAndSyncIdentity(url: string) {
    return this.apiService.get(url);
  }

  // 4. WordPress Update logic
  updateWordPressKey(path: string, data: FormData, headers: any) {
    // If running in WP, origin is the site. If local dev, you might need a full URL.
    const wpUrl = path.startsWith('http') ? path : `${window.location.origin}${path}`;
    return this.apiService.post(wpUrl, data, headers);
  }

  // 5. Streaming Chat
  async streamChat(prompt: string) {
    // Use the dynamic API URL instead of hardcoded localhost
    const response = await fetch(`${this.apiService.getApiUrl()}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': localStorage.getItem('api_key') || '' // Ensure auth for chat
      },
      body: JSON.stringify({
        model: 'llama3',
        messages: [{ role: 'user', content: prompt }],
        stream: true
      })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader!.read();
      done = readerDone;
      const chunk = decoder.decode(value, { stream: true });

      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              console.log(json.message.content);
            }
          } catch (e) {
            // Partial JSON chunk handling
          }
        }
      }
    }
  }

  private normalizeErrors(errors: WordPressErrorRow[]) {
    return errors.map((item) => ({
      _id: String(item._id ?? item.id ?? ''),
      message: String(item.message ?? 'Unknown error'),
      file: String(item.file ?? ''),
      time: String(item.time ?? new Date().toISOString()),
      line: Number(item.line ?? 0),
      level: String(item.level ?? ''),
      ai_explanation: item.ai_explanation ? String(item.ai_explanation) : undefined,
    }));
  }

  private normalizeNetwork(networkLogs: WordPressNetworkRow[]): RuntimeNetworkLog[] {
    return networkLogs.map((item) => ({
      _id: String(item._id ?? item.id ?? ''),
      direction: String(item.direction ?? 'inbound'),
      url: String(item.url ?? ''),
      method: String(item.method ?? 'GET').toUpperCase(),
      status_code: String(item.status_code ?? ''),
      ip_address: String(item.ip_address ?? ''),
      memory_usage: String(item.memory_usage ?? ''),
      time: String(item.time ?? new Date().toISOString()),
    }));
  }
}
