import { afterNextRender, Component, computed, effect, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { LogoutPrompt } from '../../components/logout-dialog/logout-prompt';
import { ProfileNameComponent } from '../../components/profile-name/profile-name.component';
import { ApiService, HomeChanged, HomeDashboard, PulsePoint } from '../../services/api.service';
import { environment } from '../../../environments/environment';

function resourceErrorMessage(error: unknown, fallback: string): string {
  if (!error) return '';
  if (typeof error !== 'object') return fallback;
  const httpError = error as { error?: { error?: string; message?: string }; message?: string };
  return httpError.error?.error || httpError.error?.message || httpError.message || fallback;
}

function currentMonthValue(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function utcDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(value: string, days: number): string {
  const date = utcDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}

function startOfWeek(value: string): string {
  const date = utcDate(value);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return isoDate(date);
}

function monthBounds(monthValue: string): { start: string; end: string } {
  const [year, month] = monthValue.split('-').map(Number);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  return { start, end: isoDate(new Date(Date.UTC(year, month, 0))) };
}

function weekLabel(start: string, end: string): string {
  const left = utcDate(start);
  const right = utcDate(end);
  const sameMonth = left.getUTCMonth() === right.getUTCMonth();
  const startText = left.toLocaleDateString(undefined, {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
    timeZone: 'UTC'
  });
  const endText = right.toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${startText} – ${endText}`;
}

function weeksInMonth(monthValue: string): { start: string; label: string }[] {
  const { start, end } = monthBounds(monthValue);
  let cursor = startOfWeek(start);
  const last = startOfWeek(end);
  const weeks: { start: string; label: string }[] = [];
  while (cursor <= last) {
    const finish = addUtcDays(cursor, 6);
    weeks.push({ start: cursor, label: weekLabel(cursor, finish) });
    cursor = addUtcDays(cursor, 7);
  }
  return weeks;
}

function defaultWeek(monthValue: string, today = localDateInput()): string {
  const weeks = weeksInMonth(monthValue);
  return weeks.find(week => today >= week.start && today <= addUtcDays(week.start, 6))?.start ?? weeks[0].start;
}

function monthTitle(monthValue: string): string {
  const [year, month] = monthValue.split('-').map(Number);
  return utcDate(`${year}-${String(month).padStart(2, '0')}-01`).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function localDateInput(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function text(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value);
}

function readDashboard(raw: unknown): HomeDashboard {
  const item = (raw ?? {}) as Record<string, unknown>;
  const my = item['myStatus'] as Record<string, unknown> | null;
  const members = Array.isArray(item['members']) ? item['members'] as Record<string, unknown>[] : [];
  const activities = Array.isArray(item['recentActivities']) ? item['recentActivities'] as Record<string, unknown>[] : [];
  const history = Array.isArray(item['history']) ? item['history'] as Record<string, unknown>[] : [];

  return {
    homeId: text(item['homeId']),
    homeName: text(item['homeName']),
    score: Number(item['score'] ?? 0),
    lowMood: Boolean(item['lowMood']),
    alert: item['alert'] == null ? null : text(item['alert']),
    moodScore: Number(item['moodScore'] ?? 0),
    energyScore: Number(item['energyScore'] ?? 0),
    completedCount: Number(item['completedCount'] ?? 0),
    missedCount: Number(item['missedCount'] ?? 0),
    positiveNotes: Number(item['positiveNotes'] ?? 0),
    averageMood: text(item['averageMood'], 'none'),
    averageEnergy: text(item['averageEnergy'], 'none'),
    myStatus: my ? {
      mood: text(my['mood'], 'normal'),
      energy: text(my['energy'], 'medium'),
      availability: text(my['availability'], 'available')
    } : null,
    members: members.map(member => ({
      userId: text(member['userId']),
      name: text(member['name']),
      role: text(member['role']),
      mood: member['mood'] == null ? null : text(member['mood']),
      energy: member['energy'] == null ? null : text(member['energy']),
      availability: member['availability'] == null ? null : text(member['availability'])
    })),
    recentActivities: activities.map(activity => ({
      id: text(activity['id']),
      userName: text(activity['userName']),
      type: text(activity['type']),
      completed: Boolean(activity['completed']),
      comment: activity['comment'] == null ? null : text(activity['comment']),
      occurredOn: text(activity['occurredOn']),
      createdAt: text(activity['createdAt'])
    })),
    history: history.map(point => ({
      day: text(point['day']),
      score: point['score'] == null ? null : Number(point['score'])
    }))
  };
}

@Component({
  selector: 'app-home-details',
  standalone: true,
  imports: [RouterModule, ProfileNameComponent],
  templateUrl: './home-details.component.html',
  styleUrls: ['./home-details.component.scss']
})
export class HomeDetailsComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);
  private readonly userId = signal<string | null>(null);
  private connection: { stop: () => Promise<void> } | null = null;
  private joinedHomeId = '';
  private listenGeneration = 0;
  private statusReady = false;
  private knownHomeName = '';
  private chartReady: Promise<typeof import('chart.js')> | null = null;
  private readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('pulseChart');

  readonly homeId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );
  readonly dashboard = httpResource<HomeDashboard>(() => {
    const id = this.homeId();
    const userId = this.userId();
    if (!id || !userId) return undefined;
    return `${environment.apiUrl}/homes/${id}/dashboard?userId=${userId}&month=${this.selectedMonth()}-01`;
  }, { parse: readDashboard });
  readonly actionError = signal('');
  readonly detailsError = computed(() =>
    this.actionError() || resourceErrorMessage(this.dashboard.error(), 'Failed to load this home.')
  );
  readonly inviteCode = signal('');
  readonly isGeneratingInvite = signal(false);
  readonly isSavingStatus = signal(false);
  readonly isLoggingActivity = signal(false);
  readonly notices = signal<Array<{ id: string; message: string; alert: boolean }>>([]);
  readonly mood = signal('normal');
  readonly energy = signal('medium');
  readonly availability = signal('available');
  readonly activityType = signal('cleaning');
  readonly activityDone = signal(true);
  readonly activityComment = signal('');
  readonly activityDate = signal(localDateInput());
  readonly homeName = signal('');
  readonly isSavingHome = signal(false);
  readonly selectedMonth = signal(currentMonthValue());
  readonly latestMonth = currentMonthValue();
  readonly pulseRange = signal<'month' | 'week'>('month');
  readonly selectedWeek = signal(defaultWeek(currentMonthValue()));
  readonly weeks = computed(() => weeksInMonth(this.selectedMonth()));
  readonly chartTitle = computed(() => {
    if (this.pulseRange() === 'month') return monthTitle(this.selectedMonth());
    return this.weeks().find(week => week.start === this.selectedWeek())?.label ?? 'Week';
  });
  readonly chartPoints = computed(() => {
    const history = this.dashboard.value()?.history ?? [];
    if (this.pulseRange() === 'month') {
      const { start, end } = monthBounds(this.selectedMonth());
      return history.filter(point => point.day >= start && point.day <= end);
    }
    const start = this.selectedWeek();
    const end = addUtcDays(start, 6);
    return history.filter(point => point.day >= start && point.day <= end);
  });
  readonly isOwner = computed(() => {
    const id = this.userId();
    return (this.dashboard.value()?.members ?? []).some(member => member.userId === id && member.role === 'owner');
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

    effect(() => {
      const id = this.homeId();
      const user = this.userId();
      if (!id || !user) return;
      void this.listen(id);
    });

    effect(() => {
      const mine = this.dashboard.value()?.myStatus;
      if (!mine || this.statusReady) return;
      this.mood.set(mine.mood);
      this.energy.set(mine.energy);
      this.availability.set(mine.availability);
      this.statusReady = true;
    });

    effect(() => {
      const name = this.dashboard.value()?.homeName ?? '';
      if (!name || name === this.knownHomeName) return;
      if (!this.homeName() || this.homeName() === this.knownHomeName) {
        this.homeName.set(name);
      }
      this.knownHomeName = name;
    });

    effect(() => {
      const canvas = this.chartCanvas()?.nativeElement;
      const points = this.chartPoints();
      const range = this.pulseRange();
      if (!canvas || !points.length) return;
      void this.drawChart(canvas, points, range);
    });
  }

  ngOnDestroy() {
    this.listenGeneration += 1;
    void this.connection?.stop();
  }

  isCurrentUser(id: string): boolean {
    return id === this.userId();
  }

  private logoutPrompt = inject(LogoutPrompt);

  logout() {
    this.logoutPrompt.ask();
  }

  scoreTone(score: number): string {
    if (score >= 70) return 'good';
    if (score >= 40) return 'ok';
    return 'low';
  }

  activityLabel(type: string): string {
    const labels: Record<string, string> = {
      cleaning: 'Cleaning',
      shopping: 'Shopping',
      kitchen: 'Kitchen',
      trash: 'Trash',
      tidying: 'Tidying'
    };
    return labels[type] ?? type;
  }

  activityWhen(value: string): string {
    if (!value) return '';
    const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  setMood(event: Event) { this.mood.set((event.target as HTMLSelectElement).value); }
  setEnergy(event: Event) { this.energy.set((event.target as HTMLSelectElement).value); }
  setAvailability(event: Event) { this.availability.set((event.target as HTMLSelectElement).value); }
  setActivityType(event: Event) { this.activityType.set((event.target as HTMLSelectElement).value); }
  setActivityDone(event: Event) { this.activityDone.set((event.target as HTMLSelectElement).value === 'done'); }
  setComment(event: Event) { this.activityComment.set((event.target as HTMLInputElement).value); }
  setActivityDate(event: Event) { this.activityDate.set((event.target as HTMLInputElement).value); }
  setMonth(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (!/^\d{4}-\d{2}$/.test(value) || value > this.latestMonth) return;
    this.selectedMonth.set(value);
    const weeks = weeksInMonth(value);
    if (!weeks.some(week => week.start === this.selectedWeek())) {
      this.selectedWeek.set(defaultWeek(value));
    }
  }

  setWeek(event: Event) {
    this.selectedWeek.set((event.target as HTMLSelectElement).value);
  }

  setHomeName(event: Event) { this.homeName.set((event.target as HTMLInputElement).value); }
  todayDate(): string { return localDateInput(); }

  saveStatus() {
    const homeId = this.homeId();
    const userId = this.userId();
    if (!homeId || !userId) return;

    this.isSavingStatus.set(true);
    this.actionError.set('');
    this.apiService.updateDailyStatus({
      homeId,
      userId,
      mood: this.mood(),
      energy: this.energy(),
      availability: this.availability()
    }).subscribe({
      next: () => {
        this.isSavingStatus.set(false);
        this.dashboard.reload();
      },
      error: (error) => {
        this.actionError.set(error.error?.error || error.error?.message || 'Failed to save today\'s check-in.');
        this.isSavingStatus.set(false);
      }
    });
  }

  logActivity() {
    const homeId = this.homeId();
    const userId = this.userId();
    if (!homeId || !userId) return;

    this.isLoggingActivity.set(true);
    this.actionError.set('');
    this.apiService.logActivity({
      homeId,
      userId,
      type: this.activityType(),
      completed: this.activityDone(),
      comment: this.activityComment().trim() || null,
      occurredOn: this.activityDate()
    }).subscribe({
      next: () => {
        this.activityComment.set('');
        this.activityDate.set(localDateInput());
        this.isLoggingActivity.set(false);
        this.dashboard.reload();
      },
      error: (error) => {
        this.actionError.set(error.error?.error || error.error?.message || 'Failed to log that activity.');
        this.isLoggingActivity.set(false);
      }
    });
  }

  saveHomeName() {
    const homeId = this.homeId();
    const userId = this.userId();
    const newName = this.homeName().trim();
    if (!homeId || !userId || newName.length < 2) return;

    this.isSavingHome.set(true);
    this.actionError.set('');
    this.apiService.updateHome({ homeId, executorUserId: userId, newName }).subscribe({
      next: () => {
        this.homeName.set(newName);
        this.knownHomeName = newName;
        this.isSavingHome.set(false);
        this.dashboard.reload();
      },
      error: (error) => {
        this.actionError.set(error.error?.error || error.error?.message || 'Failed to rename the home.');
        this.isSavingHome.set(false);
      }
    });
  }

  changeRole(targetUserId: string, event: Event) {
    const homeId = this.homeId();
    const userId = this.userId();
    const role = (event.target as HTMLSelectElement).value;
    if (!homeId || !userId) return;

    this.actionError.set('');
    this.apiService.updateMemberRole({
      homeId,
      executorUserId: userId,
      targetUserId,
      role
    }).subscribe({
      next: () => this.dashboard.reload(),
      error: (error) => {
        this.actionError.set(error.error?.error || error.error?.message || 'Failed to change that role.');
        this.dashboard.reload();
      }
    });
  }

  removeMember(targetUserId: string, name: string) {
    const homeId = this.homeId();
    const userId = this.userId();
    if (!homeId || !userId) return;
    if (!confirm(`Remove ${name} from this home?`)) return;

    this.actionError.set('');
    this.apiService.removeMember({ homeId, executorUserId: userId, targetUserId }).subscribe({
      next: () => this.dashboard.reload(),
      error: (error) => {
        this.actionError.set(error.error?.error || error.error?.message || 'Failed to remove that tenant.');
      }
    });
  }

  generateInviteCode() {
    const homeId = this.homeId();
    const userId = this.userId();
    if (!homeId || !userId) return;

    this.isGeneratingInvite.set(true);
    this.actionError.set('');
    this.apiService.generateInviteCode({
      homeId,
      executorUserId: userId
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

  private async listen(homeId: string) {
    if (this.joinedHomeId === homeId && this.connection) return;

    const generation = ++this.listenGeneration;
    await this.connection?.stop().catch(() => undefined);
    this.connection = null;
    this.joinedHomeId = '';

    const { HubConnectionBuilder } = await import('@microsoft/signalr');
    if (generation !== this.listenGeneration) return;

    const connection = new HubConnectionBuilder()
      .withUrl(environment.hubUrl)
      .withAutomaticReconnect()
      .build();

    connection.on('homeChanged', (payload: HomeChanged) => this.onHomeChanged(payload));
    await connection.start();
    await connection.invoke('JoinHome', homeId);
    if (generation !== this.listenGeneration) {
      await connection.stop();
      return;
    }

    this.connection = connection;
    this.joinedHomeId = homeId;
  }

  private onHomeChanged(payload: HomeChanged) {
    this.dashboard.reload();
    if (payload.actorUserId !== this.userId() && payload.message) {
      this.pushNotice(payload.message, false);
    }
    if (payload.alert) {
      this.pushNotice(payload.alert, true);
    }
  }

  private pushNotice(message: string, alert: boolean) {
    const current = this.notices();
    if (current[0]?.message === message) return;
    this.notices.set([{ id: crypto.randomUUID(), message, alert }, ...current].slice(0, 5));
  }

  private async drawChart(canvas: HTMLCanvasElement, points: PulsePoint[], range: 'week' | 'month') {
    const key = `${range}|` + points.map(point => `${point.day}:${point.score ?? ''}`).join('|');
    if (canvas.dataset['weekKey'] === key) return;
    canvas.dataset['weekKey'] = key;

    const { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } =
      await (this.chartReady ??= import('chart.js'));
    if (!canvas.isConnected || canvas.dataset['weekKey'] !== key) return;

    Chart.getChart(canvas)?.destroy();
    Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: points.map(point => this.dayLabel(point.day, range)),
        datasets: [{
          label: 'HomePulse',
          data: points.map(point => point.score),
          borderColor: '#009A96',
          backgroundColor: 'rgba(55, 207, 203, 0.18)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          spanGaps: false,
          pointRadius: range === 'month' ? 3 : 4,
          pointBackgroundColor: '#009A96'
        }]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, ticks: { stepSize: 20 } },
          x: {
            grid: { display: false },
            ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: range === 'month' ? 8 : 7 }
          }
        }
      }
    });
  }

  private dayLabel(day: string, range: 'week' | 'month'): string {
    const date = new Date(`${day}T00:00:00Z`);
    const options: Intl.DateTimeFormatOptions = range === 'month'
      ? { day: 'numeric', month: 'short', timeZone: 'UTC' }
      : { weekday: 'short', day: 'numeric', timeZone: 'UTC' };
    return date.toLocaleDateString(undefined, options);
  }
}
