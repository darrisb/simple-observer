import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';

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

interface WordPressLogsResponse {
  success?: boolean;
  data?: {
    errors?: WordPressErrorRow[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class ReportAnalysisService {
  // Prefer the current prefixed config, fall back to legacy config key.
  wpConfig = (window as any).MYOBRM_CONFIG ?? (window as any).AI_CONFIG;

  constructor(private apiService: ApiService) {}

  // 1. Fetching Logs
  getReportAnalysisFromApi() {
    const action = 'myobrm_get_logs';
    const nonce = this.wpConfig?.nonce;
    const ajaxUrl = this.wpConfig?.ajaxUrl || this.wpConfig?.apiUrl;
    if (!ajaxUrl) {
      return of({ errors: [] });
    }

    const formData = new FormData();
    formData.append('action', action);
    if (nonce) {
      formData.append('nonce', nonce);
    }
    formData.append('log_type', 'errors');
    formData.append('limit', '500');

    return this.apiService.post<WordPressLogsResponse>(ajaxUrl, formData).pipe(
      map((response) => ({
        errors: this.normalizeErrors(response?.data?.errors ?? [])
      })),
      catchError(() => of({ errors: [] }))
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
}
