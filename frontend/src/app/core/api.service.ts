import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UpdateNameRequest {
  userId: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  updateUserName(request: UpdateNameRequest): Observable<{ name: string }> {
    return this.http.put<{ name: string }>(`${this.apiUrl}/users/name`, request);
  }
}
