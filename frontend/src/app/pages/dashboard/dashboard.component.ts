import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { HomeListItem } from '../../services/api.service';
import { environment } from '../../../environments/environment';

function normalizeHomes(raw: unknown): HomeListItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: Record<string, unknown>) => ({
    id: String(item['id'] ?? item['Id'] ?? ''),
    name: String(item['name'] ?? item['Name'] ?? ''),
    role: String(item['role'] ?? item['Role'] ?? '')
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
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly userId = signal<string | null>(null);

  readonly userName = signal('User');
  readonly waitingForSession = computed(() => this.userId() === null);
  readonly homes = httpResource<HomeListItem[]>(() => {
    const id = this.userId();
    return id ? `${environment.apiUrl}/homes/user/${id}` : undefined;
  }, {
    defaultValue: [],
    parse: normalizeHomes
  });
  readonly loadError = computed(() =>
    resourceErrorMessage(this.homes.error(), 'Failed to load homes. Please try again.')
  );

  constructor() {
    afterNextRender(() => {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        this.router.navigate(['/login']);
        return;
      }

      this.userId.set(storedUserId);
      this.userName.set(localStorage.getItem('userName') || 'User');
    });
  }

  viewHomeDetails(homeId: string) {
    this.router.navigate(['/home', homeId]);
  }

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    this.router.navigate(['/']);
  }
}
