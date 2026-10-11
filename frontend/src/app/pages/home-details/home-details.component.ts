import { afterNextRender, Component, computed, effect, ElementRef, inject, OnDestroy, signal, viewChild, WritableSignal } from '@angular/core';
import { httpResource, HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageSelectComponent } from '../../components/language-select/language-select.component';
import { LogoutPrompt } from '../../components/logout-dialog/logout-prompt';
import { ProfileNameComponent } from '../../components/profile-name/profile-name.component';
import { Dialog } from '@angular/cdk/dialog';
import { ApiService, ActivityItem, HomeChanged, HomeDashboard, HomeTurnItem, PulsePoint, TaskSuggestion } from '../../services/api.service';
import { HOUSEHOLD_TASKS, TASK_GROUPS, householdTask } from '../../services/household-tasks';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ChoiceFieldComponent, ChoiceOption } from '../../components/choice-field/choice-field.component';
import { DateFieldComponent } from '../../components/date-field/date-field.component';
import { LanguageService } from '../../services/language.service';
import { environment } from '../../../environments/environment';
import { noticeText } from '../../services/notice-text';
import { SessionService } from '../../services/session.service';

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

function weekLabel(start: string, end: string, locale: string): string {
  const left = utcDate(start);
  const right = utcDate(end);
  const sameMonth = left.getUTCMonth() === right.getUTCMonth();
  const startText = left.toLocaleDateString(locale, {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
    timeZone: 'UTC'
  });
  const endText = right.toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${startText} – ${endText}`;
}

function weeksInMonth(monthValue: string, locale: string): { start: string; label: string }[] {
  const { start, end } = monthBounds(monthValue);
  let cursor = startOfWeek(start);
  const last = startOfWeek(end);
  const weeks: { start: string; label: string }[] = [];
  while (cursor <= last) {
    const finish = addUtcDays(cursor, 6);
    weeks.push({ start: cursor, label: weekLabel(cursor, finish, locale) });
    cursor = addUtcDays(cursor, 7);
  }
  return weeks;
}

function defaultWeek(monthValue: string, today = localDateInput()): string {
  const weeks = weeksInMonth(monthValue, 'en');
  return weeks.find(week => today >= week.start && today <= addUtcDays(week.start, 6))?.start ?? weeks[0].start;
}

function monthTitle(monthValue: string, locale: string): string {
  const [year, month] = monthValue.split('-').map(Number);
  return utcDate(`${year}-${String(month).padStart(2, '0')}-01`).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function localDateInput(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function shiftDate(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return localDateInput(date);
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
  const shares = Array.isArray(item['shares']) ? item['shares'] as Record<string, unknown>[] : [];
  const turns = Array.isArray(item['turns']) ? item['turns'] as Record<string, unknown>[] : [];
  const suggestion = item['suggestion'] as Record<string, unknown> | null;

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
      userId: text(activity['userId']),
      userName: text(activity['userName']),
      type: text(activity['type']),
      taskKey: activity['taskKey'] == null ? null : text(activity['taskKey']),
      weight: Math.max(1, Number(activity['weight'] ?? 1)),
      completed: Boolean(activity['completed']),
      comment: activity['comment'] == null ? null : text(activity['comment']),
      occurredOn: text(activity['occurredOn']),
      createdAt: text(activity['createdAt'])
    })),
    history: history.map(point => ({
      day: text(point['day']),
      score: point['score'] == null ? null : Number(point['score'])
    })),
    shares: shares.map(share => ({
      userId: text(share['userId']),
      name: text(share['name']),
      points: Number(share['points'] ?? 0),
      percent: Number(share['percent'] ?? 0)
    })),
    suggestion: suggestion ? {
      kind: text(suggestion['kind'], 'even'),
      yours: Number(suggestion['yours'] ?? 0),
      otherName: suggestion['otherName'] == null ? null : text(suggestion['otherName']),
      theirs: Number(suggestion['theirs'] ?? 0),
      taskKeys: Array.isArray(suggestion['taskKeys']) ? suggestion['taskKeys'].map(key => text(key)) : []
    } : null,
    turns: turns.map(turn => ({
      id: text(turn['id']),
      taskKey: text(turn['taskKey']),
      intervalDays: Number(turn['intervalDays'] ?? 7),
      alertDays: Number(turn['alertDays'] ?? 3),
      dueOn: text(turn['dueOn']),
      daysUntil: Number(turn['daysUntil'] ?? 0),
      userId: text(turn['userId']),
      userName: text(turn['userName'])
    }))
  };
}

@Component({
  selector: 'app-home-details',
  standalone: true,
  imports: [RouterModule, ProfileNameComponent, TranslateModule, LanguageSelectComponent, DateFieldComponent, ChoiceFieldComponent],
  templateUrl: './home-details.component.html',
  styleUrls: ['./home-details.component.scss']
})
export class HomeDetailsComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly userId = signal<string | null>(null);
  private readonly session = inject(SessionService);
  private readonly dialog = inject(Dialog);
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
    return `${environment.apiUrl}/homes/${id}/dashboard?month=${this.selectedMonth()}-01`;
  }, { parse: readDashboard });
  readonly actionError = signal('');
  readonly detailsError = computed(() => {
    this.language.current();
    return this.actionError() || resourceErrorMessage(this.dashboard.error(), this.translate.instant('Home.LoadFailed'));
  });
  readonly inviteCode = signal('');
  readonly isGeneratingInvite = signal(false);
  readonly isSavingStatus = signal(false);
  readonly isLoggingActivity = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly editDone = signal(true);
  readonly editDate = signal(localDateInput());
  readonly editComment = signal('');
  readonly isSavingEdit = signal(false);
  readonly toastItem = signal<{ id: number; message: string; error: boolean } | null>(null);
  readonly checkinNotice = signal<{ id: number; message: string; error: boolean } | null>(null);
  readonly activityNotice = signal<{ id: number; message: string; error: boolean } | null>(null);
  private toastSeq = 0;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  readonly notices = signal<Array<{ id: string; message: string; alert: boolean }>>([]);
  readonly mood = signal('normal');
  readonly energy = signal('medium');
  readonly availability = signal('available');
  readonly tab = signal<'today' | 'tasks' | 'turns' | 'people'>('today');
  readonly taskGroups = TASK_GROUPS;
  readonly householdTasks = HOUSEHOLD_TASKS;
  readonly taskFilter = signal('all');
  readonly whenFilter = signal('14');
  readonly activityTask = signal('bathroom');
  readonly activityStars = signal(5);
  readonly editTask = signal('bathroom');
  readonly editStars = signal(5);
  readonly turnTask = signal('bathroom');
  readonly turnInterval = signal(7);
  readonly turnAlert = signal(3);
  readonly turnStart = signal(localDateInput());
  readonly turnMembers = signal<string[]>([]);
  readonly isSavingTurn = signal(false);
  readonly turnNotice = signal<{ id: number; message: string; error: boolean } | null>(null);
  private turnMembersReady = false;
  readonly activityDone = signal(true);
  readonly activityComment = signal('');
  readonly activityDate = signal(localDateInput());
  readonly homeName = signal('');
  readonly isSavingHome = signal(false);
  readonly selectedMonth = signal(currentMonthValue());
  readonly latestMonth = currentMonthValue();
  readonly pulseRange = signal<'month' | 'week'>('month');
  readonly selectedWeek = signal(defaultWeek(currentMonthValue()));
  readonly weeks = computed(() => weeksInMonth(this.selectedMonth(), this.language.current()));
  readonly chartTitle = computed(() => {
    const locale = this.language.current();
    if (this.pulseRange() === 'month') return monthTitle(this.selectedMonth(), locale);
    return this.weeks().find(week => week.start === this.selectedWeek())?.label ?? this.translate.instant('Home.Week');
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
      const storedUserId = this.session.userId();
      if (!this.session.token() || !storedUserId) {
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
      void this.loadMissedNotices(id);
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
      const members = this.dashboard.value()?.members ?? [];
      if (this.turnMembersReady || members.length === 0) return;
      this.turnMembers.set(members.map(member => member.userId));
      this.turnMembersReady = true;
    });

    effect(() => {
      const canvas = this.chartCanvas()?.nativeElement;
      const points = this.chartPoints();
      const range = this.pulseRange();
      const locale = this.language.current();
      if (!canvas || !points.length) return;
      void this.drawChart(canvas, points, range, locale);
    });
  }

  ngOnDestroy() {
    this.listenGeneration += 1;
    void this.connection?.stop();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    for (const timer of this.noticeTimers.values()) clearTimeout(timer);
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

  taskChoices(): ChoiceOption[] {
    this.language.current();
    return TASK_GROUPS.flatMap(group =>
      this.tasksIn(group).map(task => ({
        value: task.key,
        label: `${task.icon} ${this.activityLabel(task.key)}`,
        group: this.activityLabel(group)
      }))
    );
  }

  namedChoices(prefix: string, values: string[]): ChoiceOption[] {
    this.language.current();
    return values.map(value => ({ value, label: this.translate.instant(`${prefix}.${value}`) }));
  }

  filterChoices(): ChoiceOption[] {
    this.language.current();
    return [
      { value: 'all', label: this.translate.instant('Home.FilterAll') },
      ...TASK_GROUPS.map(group => ({ value: group, label: this.activityLabel(group) }))
    ];
  }

  outcomeChoices(): ChoiceOption[] {
    this.language.current();
    return [
      { value: 'done', label: this.translate.instant('Outcome.Done') },
      { value: 'missed', label: this.translate.instant('Outcome.Missed') }
    ];
  }

  whenChoices(): ChoiceOption[] {
    this.language.current();
    return [
      { value: '7', label: this.translate.instant('Home.Last7') },
      { value: '14', label: this.translate.instant('Home.Last14') },
      { value: '30', label: this.translate.instant('Home.Last30') },
      { value: 'all', label: this.translate.instant('Home.AllTime') }
    ];
  }

  weekChoices(): ChoiceOption[] {
    return this.weeks().map(week => ({ value: week.start, label: week.label }));
  }

  activityLabel(type: string): string {
    this.language.current();
    const key = `Tasks.${type}`;
    const label = this.translate.instant(key);
    return label === key ? type : label;
  }

  loggedLine(activity: ActivityItem): string {
    this.language.current();
    return this.translate.instant('Home.LoggedLine', {
      name: activity.userName,
      task: this.activityLabel(activity.taskKey || activity.type),
      outcome: this.translate.instant(activity.completed ? 'Outcome.done' : 'Outcome.missed')
    });
  }

  taskIcon(key: string): string {
    return householdTask(key)?.icon ?? '🏠';
  }

  taskMinutes(key: string): number {
    return householdTask(key)?.minutes ?? 0;
  }

  tasksIn(group: string) {
    return HOUSEHOLD_TASKS.filter(task => task.group === group);
  }

  readonly visibleActivities = computed(() => {
    const items = this.dashboard.value()?.recentActivities ?? [];
    const task = this.taskFilter();
    const when = this.whenFilter();
    const today = localDateInput();
    return items.filter(activity => {
      const key = activity.taskKey || activity.type;
      const group = householdTask(key)?.group ?? activity.type;
      if (task !== 'all' && task !== key && task !== group) return false;
      if (when === 'all') return true;
      const start = shiftDate(today, 1 - Number(when));
      return activity.occurredOn.slice(0, 10) >= start;
    });
  });

  suggestionText(suggestion: TaskSuggestion): string {
    this.language.current();
    if (suggestion.kind === 'empty') return this.translate.instant('Home.SuggestionEmpty');
    if (suggestion.kind === 'behind') {
      return this.translate.instant('Home.SuggestionBehind', {
        yours: suggestion.yours,
        name: suggestion.otherName ?? '',
        theirs: suggestion.theirs
      });
    }
    return this.translate.instant('Home.SuggestionEven', { yours: suggestion.yours });
  }

  turnLine(turn: HomeTurnItem): string {
    this.language.current();
    const task = this.activityLabel(turn.taskKey);
    if (turn.daysUntil <= 0) return this.translate.instant('Home.TurnToday', { name: turn.userName, task });
    if (turn.daysUntil === 1) return this.translate.instant('Home.TurnTomorrow', { name: turn.userName, task });
    return this.translate.instant('Home.TurnInDays', { days: turn.daysUntil, name: turn.userName, task });
  }

  stars(count: number): string {
    const safe = Math.max(1, Math.min(5, count || 1));
    return '★'.repeat(safe) + '☆'.repeat(5 - safe);
  }

  setTab(tab: 'today' | 'tasks' | 'turns' | 'people') { this.tab.set(tab); }
  setTaskFilter(value: string) { this.taskFilter.set(value); }
  setWhenFilter(value: string) { this.whenFilter.set(value); }

  setActivityTask(key: string) {
    this.activityTask.set(key);
    this.activityStars.set(householdTask(key)?.stars ?? 1);
  }

  setActivityStars(stars: number) { this.activityStars.set(stars); }

  pickSuggested(key: string) {
    this.activityTask.set(key);
    this.activityStars.set(householdTask(key)?.stars ?? 1);
    this.tab.set('tasks');
  }

  moodSummary(mood: string, energy: string): string {
    this.language.current();
    return this.translate.instant('Home.MoodSummary', {
      mood: this.translate.instant(`Mood.${mood}`),
      energy: this.translate.instant(`Energy.${energy}`)
    });
  }

  phrase(message: string): string {
    this.language.current();
    return noticeText(this.translate, message);
  }

  private loadMissedNotices(homeId: string) {
    this.http.get<Array<Record<string, unknown>>>(
      `${environment.apiUrl}/homes/notices?homeId=${homeId}`
    ).subscribe(rows => {
      for (const row of [...rows].reverse()) {
        const message = String(row['message'] ?? row['Message'] ?? '');
        const alert = row['alert'] ?? row['Alert'];
        if (message) this.pushNotice(message, false);
        if (typeof alert === 'string' && alert) this.pushNotice(alert, true);
      }
    });
  }

  activityWhen(value: string): string {
    if (!value) return '';
    const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(this.language.current(), { day: 'numeric', month: 'short', year: 'numeric' });
  }

  setMood(value: string) { this.mood.set(value); }
  setEnergy(value: string) { this.energy.set(value); }
  setAvailability(value: string) { this.availability.set(value); }
  setTurnTask(value: string) { this.turnTask.set(value); }
  setTurnInterval(event: Event) { this.turnInterval.set(Number((event.target as HTMLInputElement).value) || 7); }
  setTurnAlert(event: Event) { this.turnAlert.set(Number((event.target as HTMLInputElement).value) || 0); }
  setTurnStart(value: string) { this.turnStart.set(value); }

  memberInTurn(id: string): boolean {
    return this.turnMembers().includes(id);
  }

  toggleTurnMember(id: string) {
    const current = this.turnMembers();
    this.turnMembers.set(current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  saveTurn() {
    const homeId = this.homeId();
    const userId = this.userId();
    if (!homeId || !userId || this.turnMembers().length === 0) return;
    this.isSavingTurn.set(true);
    this.apiService.saveTurn(homeId, {
      homeId,
      userId,
      taskKey: this.turnTask(),
      intervalDays: this.turnInterval(),
      alertDays: this.turnAlert(),
      startsOn: this.turnStart(),
      memberIds: this.turnMembers()
    }).subscribe({
      next: () => {
        this.isSavingTurn.set(false);
        this.showToast(this.translate.instant('Home.TurnSaved'));
        this.flashNotice(this.turnNotice, this.translate.instant('Home.TurnSaved'));
        this.dashboard.reload();
      },
      error: (error) => {
        const message = error.error?.error || error.error?.message || this.translate.instant('Home.TurnFailed');
        this.showToast(message, true);
        this.flashNotice(this.turnNotice, message, true);
        this.isSavingTurn.set(false);
      }
    });
  }

  removeTurn(turn: HomeTurnItem) {
    const homeId = this.homeId();
    if (!homeId) return;
    this.apiService.removeTurn(homeId, turn.id).subscribe({
      next: () => this.dashboard.reload(),
      error: (error) => {
        this.flashNotice(this.turnNotice, error.error?.error || error.error?.message || this.translate.instant('Home.TurnFailed'), true);
      }
    });
  }
  setActivityDone(value: string) { this.activityDone.set(value === 'done'); }
  setComment(event: Event) { this.activityComment.set((event.target as HTMLInputElement).value); }
  setActivityDate(value: string) { this.activityDate.set(value); }
  setMonth(value: string) {
    if (!/^\d{4}-\d{2}$/.test(value) || value > this.latestMonth) return;
    this.selectedMonth.set(value);
    const weeks = weeksInMonth(value, this.language.current());
    if (!weeks.some(week => week.start === this.selectedWeek())) {
      this.selectedWeek.set(defaultWeek(value));
    }
  }

  setWeek(value: string) {
    this.selectedWeek.set(value);
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
        this.showToast(this.translate.instant('Home.CheckinSaved'));
        this.flashNotice(this.checkinNotice, this.translate.instant('Home.CheckinSaved'));
        this.dashboard.reload();
      },
      error: (error) => {
        const message = error.error?.error || error.error?.message || this.translate.instant('Home.CheckinFailed');
        this.showToast(message, true);
        this.flashNotice(this.checkinNotice, message, true);
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
    const task = householdTask(this.activityTask());
    this.apiService.logActivity({
      homeId,
      userId,
      type: task?.group ?? 'cleaning',
      taskKey: this.activityTask(),
      weight: this.activityStars(),
      completed: this.activityDone(),
      comment: this.activityComment().trim() || null,
      occurredOn: this.activityDate()
    }).subscribe({
      next: () => {
        this.activityComment.set('');
        this.activityDate.set(localDateInput());
        this.isLoggingActivity.set(false);
        this.showToast(this.translate.instant('Home.ActivityAdded'));
        this.flashNotice(this.activityNotice, this.translate.instant('Home.ActivityAdded'));
        this.dashboard.reload();
      },
      error: (error) => {
        const message = error.error?.error || error.error?.message || this.translate.instant('Home.LogFailed');
        this.showToast(message, true);
        this.flashNotice(this.activityNotice, message, true);
        this.isLoggingActivity.set(false);
      }
    });
  }

  beginActivityEdit(activity: ActivityItem) {
    const key = activity.taskKey || activity.type;
    this.editingId.set(activity.id);
    this.editTask.set(householdTask(key) ? key : 'bathroom');
    this.editStars.set(activity.weight || householdTask(key)?.stars || 1);
    this.editDone.set(activity.completed);
    this.editDate.set(activity.occurredOn.slice(0, 10));
    this.editComment.set(activity.comment ?? '');
    this.actionError.set('');
  }

  cancelActivityEdit() {
    this.editingId.set(null);
  }

  setEditTask(key: string) {
    this.editTask.set(key);
    this.editStars.set(householdTask(key)?.stars ?? this.editStars());
  }
  setEditDone(value: string) { this.editDone.set(value === 'done'); }
  setEditDate(value: string) { this.editDate.set(value); }
  setEditComment(event: Event) { this.editComment.set((event.target as HTMLInputElement).value); }

  saveActivityEdit() {
    const homeId = this.homeId();
    const userId = this.userId();
    const activityId = this.editingId();
    if (!homeId || !userId || !activityId || !this.editDate()) return;

    this.isSavingEdit.set(true);
    this.actionError.set('');
    const task = householdTask(this.editTask());
    this.apiService.updateActivity(activityId, {
      activityId,
      homeId,
      userId,
      type: task?.group ?? 'cleaning',
      taskKey: this.editTask(),
      weight: this.editStars(),
      completed: this.editDone(),
      comment: this.editComment().trim() || null,
      occurredOn: this.editDate()
    }).subscribe({
      next: () => {
        this.editingId.set(null);
        this.isSavingEdit.set(false);
        this.showToast(this.translate.instant('Home.ActivityUpdated'));
        this.dashboard.reload();
      },
      error: (error) => {
        this.actionError.set(error.error?.error || error.error?.message || this.translate.instant('Home.UpdateFailed'));
        this.isSavingEdit.set(false);
      }
    });
  }

  removeActivity(activity: ActivityItem) {
    const homeId = this.homeId();
    if (!homeId) return;

    this.dialog.open<boolean>(ConfirmDialogComponent, {
      role: 'alertdialog',
      ariaLabel: this.translate.instant('Home.RemoveActivityTitle'),
      data: {
        titleKey: 'Home.RemoveActivityTitle',
        bodyKey: 'Home.RemoveActivityConfirm',
        cancelKey: 'Logout.Cancel',
        confirmKey: 'Home.Remove'
      },
      backdropClass: 'dv-dialog-backdrop',
      panelClass: 'dv-dialog-pane',
      autoFocus: 'first-tabbable',
      width: '420px',
      maxWidth: 'calc(100vw - 2rem)'
    }).closed.subscribe(confirmed => {
      if (!confirmed) return;
      this.actionError.set('');
      this.apiService.removeActivity(activity.id, homeId).subscribe({
        next: () => {
          if (this.editingId() === activity.id) this.editingId.set(null);
          this.showToast(this.translate.instant('Home.ActivityRemoved'));
          this.dashboard.reload();
        },
        error: (error) => {
          this.actionError.set(error.error?.error || error.error?.message || this.translate.instant('Home.RemoveActivityFailed'));
        }
      });
    });
  }

  private noticeTimers = new Map<WritableSignal<{ id: number; message: string; error: boolean } | null>, ReturnType<typeof setTimeout>>();

  private flashNotice(
    target: WritableSignal<{ id: number; message: string; error: boolean } | null>,
    message: string,
    error = false
  ) {
    const id = ++this.toastSeq;
    target.set({ id, message, error });
    const pending = this.noticeTimers.get(target);
    if (pending) clearTimeout(pending);
    this.noticeTimers.set(target, setTimeout(() => {
      if (target()?.id === id) target.set(null);
    }, 4000));
  }

  private showToast(message: string, error = false) {
    const id = ++this.toastSeq;
    this.toastItem.set({ id, message, error });
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      if (this.toastItem()?.id === id) this.toastItem.set(null);
    }, 3600);
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
        this.actionError.set(error.error?.error || error.error?.message || this.translate.instant('Home.RenameFailed'));
        this.isSavingHome.set(false);
      }
    });
  }

  changeRole(targetUserId: string, role: string) {
    const homeId = this.homeId();
    const userId = this.userId();
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
        this.actionError.set(error.error?.error || error.error?.message || this.translate.instant('Home.RoleFailed'));
        this.dashboard.reload();
      }
    });
  }

  removeMember(targetUserId: string, name: string) {
    const homeId = this.homeId();
    const userId = this.userId();
    if (!homeId || !userId) return;
    if (!confirm(this.translate.instant('Home.RemoveConfirm', { name }))) return;

    this.actionError.set('');
    this.apiService.removeMember({ homeId, executorUserId: userId, targetUserId }).subscribe({
      next: () => this.dashboard.reload(),
      error: (error) => {
        this.actionError.set(error.error?.error || error.error?.message || this.translate.instant('Home.RemoveFailed'));
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
        this.actionError.set(error.error?.message || error.error?.error || this.translate.instant('Home.InviteFailed'));
        this.isGeneratingInvite.set(false);
      }
    });
  }

  copyInviteCode() {
    const code = this.inviteCode();
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        alert(this.translate.instant('Home.Copied'));
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
      .withUrl(environment.hubUrl, {
        accessTokenFactory: () => this.session.token() ?? ''
      })
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

  private async drawChart(canvas: HTMLCanvasElement, points: PulsePoint[], range: 'week' | 'month', locale: string) {
    const key = `${locale}|${range}|` + points.map(point => `${point.day}:${point.score ?? ''}`).join('|');
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
        labels: points.map(point => this.dayLabel(point.day, range, locale)),
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

  private dayLabel(day: string, range: 'week' | 'month', locale: string): string {
    const date = new Date(`${day}T00:00:00Z`);
    const options: Intl.DateTimeFormatOptions = range === 'month'
      ? { day: 'numeric', month: 'short', timeZone: 'UTC' }
      : { weekday: 'short', day: 'numeric', timeZone: 'UTC' };
    return date.toLocaleDateString(locale, options);
  }
}
