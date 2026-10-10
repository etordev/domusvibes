import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageSelectComponent } from '../../components/language-select/language-select.component';
import { LogoutPrompt } from '../../components/logout-dialog/logout-prompt';
import { ProfileNameComponent } from '../../components/profile-name/profile-name.component';
import { LanguageService } from '../../services/language.service';
import { HomeListItem } from '../../services/api.service';
import { environment } from '../../../environments/environment';
import { noticeText } from '../../services/notice-text';

function normalizeHomes(raw: unknown): HomeListItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: Record<string, unknown>) => ({
    id: String(item['id'] ?? item['Id'] ?? ''),
    name: String(item['name'] ?? item['Name'] ?? ''),
    role: String(item['role'] ?? item['Role'] ?? ''),
    score: item['score'] == null && item['Score'] == null
      ? null
      : Number(item['score'] ?? item['Score'])
  }));
}

interface StoredNotice {
  id: string;
  homeName: string;
  message: string;
  alert: string;
}

function normalizeNotices(raw: unknown): StoredNotice[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: Record<string, unknown>) => ({
    id: String(item['id'] ?? item['Id'] ?? ''),
    homeName: String(item['homeName'] ?? item['HomeName'] ?? ''),
    message: String(item['message'] ?? item['Message'] ?? ''),
    alert: String(item['alert'] ?? item['Alert'] ?? '')
  }));
}

function resourceErrorMessage(error: unknown, fallback: string): string {
  if (!error) return '';
  if (typeof error !== 'object') return fallback;
  const httpError = error as { error?: { error?: string; message?: string }; message?: string };
  return httpError.error?.error || httpError.error?.message || httpError.message || fallback;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, ProfileNameComponent, TranslateModule, LanguageSelectComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly userId = signal<string | null>(null);
  readonly waitingForSession = computed(() => this.userId() === null);
  readonly homes = httpResource<HomeListItem[]>(() => {
    const id = this.userId();
    return id ? `${environment.apiUrl}/homes/user/${id}` : undefined;
  }, {
    defaultValue: [],
    parse: normalizeHomes
  });
  readonly notices = httpResource<StoredNotice[]>(() => {
    const id = this.userId();
    return id ? `${environment.apiUrl}/homes/notices?userId=${id}` : undefined;
  }, {
    defaultValue: [],
    parse: normalizeNotices
  });
  readonly loadError = computed(() => {
    this.language.current();
    return resourceErrorMessage(this.homes.error(), this.translate.instant('Dashboard.LoadFailed'));
  });

  constructor() {
    afterNextRender(() => {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        this.router.navigate(['/login']);
        return;
      }

      this.userId.set(storedUserId);
    });
  }

  noticeLine(notice: StoredNotice): string {
    this.language.current();
    const message = noticeText(this.translate, notice.message);
    const alert = notice.alert ? noticeText(this.translate, notice.alert) : '';
    return [notice.homeName, message, alert].filter(Boolean).join(' — ');
  }

  viewHomeDetails(homeId: string) {
    this.router.navigate(['/home', homeId]);
  }

  private logoutPrompt = inject(LogoutPrompt);

  logout() {
    this.logoutPrompt.ask();
  }
}
