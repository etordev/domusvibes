import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { ApiService, HomeDetails } from '../../services/api.service';
import { environment } from '../../../environments/environment';

function resourceErrorMessage(error: unknown, fallback: string): string {
  if (!error) return '';
  if (typeof error !== 'object') return fallback;
  const httpError = error as { error?: { error?: string; message?: string }; message?: string };
  return httpError.error?.error || httpError.error?.message || httpError.message || fallback;
}

@Component({
  selector: 'app-home-details',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home-details.component.html',
  styleUrls: ['./home-details.component.scss']
})
export class HomeDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);
  private readonly userId = signal('');

  readonly homeId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );
  readonly home = httpResource<HomeDetails>(() => {
    const id = this.homeId();
    return id ? `${environment.apiUrl}/homes/${id}` : undefined;
  });
  readonly actionError = signal('');
  readonly detailsError = computed(() =>
    this.actionError() || resourceErrorMessage(this.home.error(), 'Failed to load home details.')
  );
  readonly inviteCode = signal('');
  readonly isGeneratingInvite = signal(false);

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

  generateInviteCode() {
    const homeId = this.homeId();
    if (!homeId) return;

    this.isGeneratingInvite.set(true);
    this.actionError.set('');
    this.apiService.generateInviteCode({
      homeId,
      executorUserId: this.userId()
    }).subscribe({
      next: (response) => {
        this.inviteCode.set(response.inviteCode);
        this.isGeneratingInvite.set(false);
      },
      error: (error) => {
        this.actionError.set(error.error?.message || error.error?.error || 'Failed to generate invite code.');
        this.isGeneratingInvite.set(false);
      }
    });
  }

  copyInviteCode() {
    const code = this.inviteCode();
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        alert('Invite code copied to clipboard!');
      });
    }
  }
}
