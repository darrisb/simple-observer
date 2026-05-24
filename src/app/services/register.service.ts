// services/auth.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserRegistration } from '../components/interface/dashboard.interface';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  apiService = inject(ApiService);
  private apiUrl = 'http://localhost:3000/api/registration';

  constructor(private http: HttpClient) {}

  register(data: UserRegistration) {
    return this.apiService.post(this.apiUrl, data);
  }

  postToWP(url:string, formData: any, headers: any) {
    return this.apiService.post(url, formData, headers);
  }
}
