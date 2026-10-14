import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DailyStatusRequest,
  GenerateInviteCodeRequest,
  GenerateInviteCodeResponse,
  HomeChanged,
  LogActivityRequest,
  RemoveMemberRequest,
  SaveTurnRequest,
  UpdateActivityRequest,
  UpdateHomeRequest,
  UpdateMemberRoleRequest
} from '../models/home.model';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  updateDailyStatus(request: DailyStatusRequest): Observable<HomeChanged> {
    return this.http.put<HomeChanged>(`${this.apiUrl}/status/daily`, request);
  }

  logActivity(request: LogActivityRequest): Observable<HomeChanged> {
    return this.http.post<HomeChanged>(`${this.apiUrl}/activities`, request);
  }

  updateActivity(activityId: string, request: UpdateActivityRequest): Observable<HomeChanged> {
    return this.http.put<HomeChanged>(`${this.apiUrl}/activities/${activityId}`, request);
  }

  removeActivity(activityId: string, homeId: string): Observable<HomeChanged> {
    return this.http.delete<HomeChanged>(`${this.apiUrl}/activities/${activityId}?homeId=${homeId}`);
  }

  saveTurn(homeId: string, request: SaveTurnRequest): Observable<HomeChanged> {
    return this.http.post<HomeChanged>(`${this.apiUrl}/homes/${homeId}/turns`, request);
  }

  removeTurn(homeId: string, turnId: string): Observable<HomeChanged> {
    return this.http.delete<HomeChanged>(`${this.apiUrl}/homes/${homeId}/turns/${turnId}`);
  }

  updateHome(request: UpdateHomeRequest): Observable<{ updated: boolean }> {
    return this.http.put<{ updated: boolean }>(`${this.apiUrl}/homes/update`, request);
  }

  updateMemberRole(request: UpdateMemberRoleRequest): Observable<{ updated: boolean }> {
    return this.http.put<{ updated: boolean }>(`${this.apiUrl}/homes/role`, request);
  }

  removeMember(request: RemoveMemberRequest): Observable<{ removed: boolean }> {
    return this.http.delete<{ removed: boolean }>(`${this.apiUrl}/homes/remove`, { body: request });
  }

  generateInviteCode(request: GenerateInviteCodeRequest): Observable<GenerateInviteCodeResponse> {
    return this.http.post<GenerateInviteCodeResponse>(`${this.apiUrl}/homes/invite/generate`, request);
  }
}
