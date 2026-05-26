import { ApiService } from './api.service';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LogViewingService {
  apiService = inject(ApiService);
  private apiUrl = 'https://your-wordpress-site.com/wp-json/error-logs/v1/logs'; // Update with your WordPress site URL

  getErrorLogs() {
    return this.apiService.get(this.apiUrl);
  }
}
