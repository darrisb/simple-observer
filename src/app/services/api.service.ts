import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from './../../environments/environment';
import { getMockResponse, normalizeEndpoint } from '../mocks/mock-api';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private useMockApi = environment.useMockApi;

  private isWordPressEndpoint(url: string): boolean {
    return /\/wp-admin\/admin-ajax\.php(\?|$)/i.test(url)
      || /\/wp-json\//i.test(url)
      || /[?&]rest_route=/i.test(url);
  }

  private getMockData<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, body?: unknown): Observable<T> {
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const mockResponse = getMockResponse(method, normalizedEndpoint, body);

    if (mockResponse === undefined) {
      return throwError(() => new Error(`No mock configured for ${method} ${normalizedEndpoint}`));
    }

    return of(mockResponse as T).pipe(delay(150));
  }

  get<T>(endpoint: string, params?: any, headers?: any): Observable<T> {
    if (this.useMockApi) {
      return this.getMockData<T>('GET', endpoint);
    }

    // 1. Build the base URL correctly
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.apiUrl}/${endpoint}`;

    // 2. Consolidate params and headers into a single options object
    const options = {
      params: params,
      headers: new HttpHeaders(headers || {}),
      withCredentials: this.isWordPressEndpoint(url)
    };

    // 3. Pass the consolidated options to the GET call
    return this.http.get<T>(url, options);
  }


  post<T>(endpoint: string, body: any, headers?: any): Observable<T> {
    if (this.useMockApi) {
      return this.getMockData<T>('POST', endpoint, body);
    }

    // Use provided headers or default to empty object
    // If endpoint is a full URL (like admin-ajax.php), don't prepend apiUrl
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.apiUrl}/${endpoint}`;

    const httpOptions = {
      headers: new HttpHeaders(headers || {}),
      withCredentials: this.isWordPressEndpoint(url)
    };

    return this.http.post<T>(url, body, httpOptions);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    if (this.useMockApi) {
      return this.getMockData<T>('PUT', endpoint, body);
    }

    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    if (this.useMockApi) {
      return this.getMockData<T>('DELETE', endpoint);
    }

    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`);
  }

  getApiUrl() {
    return this.apiUrl;
  }
}
