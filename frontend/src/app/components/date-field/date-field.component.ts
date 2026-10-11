import { Component, computed, effect, ElementRef, HostListener, inject, input, output, signal, viewChild } from '@angular/core';
import { LanguageService } from '../../services/language.service';

interface CalendarDay {
  iso: string;
  number: number;
  inMonth: boolean;
  disabled: boolean;
}

interface CalendarMonth {
  value: string;
  label: string;
  disabled: boolean;
}

@Component({
  selector: 'app-date-field',
  standalone: true,
  templateUrl: './date-field.component.html',
  styleUrl: './date-field.component.scss'
})
export class DateFieldComponent {
  private readonly language = inject(LanguageService);

  readonly value = input('');
  readonly max = input<string | null>(null);
  readonly mode = input<'date' | 'month'>('date');
  readonly valueChange = output<string>();

  readonly open = signal(false);
  readonly dropUp = signal(false);
  readonly view = signal(new Date().toISOString().slice(0, 7));
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    effect(() => {
      const current = this.value();
      if (/^\d{4}-\d{2}/.test(current)) this.view.set(current.slice(0, 7));
    });
  }

  readonly label = computed(() => {
    const locale = this.language.current();
    const current = this.value();
    if (this.mode() === 'month') {
      return /^\d{4}-\d{2}$/.test(current) ? this.monthName(current, locale) : current;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(current)) return current;
    return new Date(`${current}T00:00:00`).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  });

  readonly heading = computed(() => this.monthName(this.view(), this.language.current()));

  readonly weekdayNames = computed(() => {
    const locale = this.language.current();
    const monday = new Date(2026, 0, 5);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      return day.toLocaleDateString(locale, { weekday: 'narrow' });
    });
  });

  readonly days = computed<CalendarDay[]>(() => {
    const [year, month] = this.view().split('-').map(Number);
    const first = new Date(year, month - 1, 1);
    const lead = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(1 - lead);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const iso = toIso(date);
      return {
        iso,
        number: date.getDate(),
        inMonth: date.getMonth() === month - 1,
        disabled: this.isAfterMax(iso)
      };
    });
  });

  readonly months = computed<CalendarMonth[]>(() => {
    const year = Number(this.view().slice(0, 4));
    const locale = this.language.current();
    return Array.from({ length: 12 }, (_, index) => {
      const value = `${year}-${String(index + 1).padStart(2, '0')}`;
      return {
        value,
        label: new Date(year, index, 1).toLocaleDateString(locale, { month: 'short' }),
        disabled: this.isAfterMax(value)
      };
    });
  });

  toggle(event: Event) {
    event.stopPropagation();
    const opening = !this.open();
    this.dropUp.set(false);
    this.open.set(opening);
    if (!opening) return;
    this.place(0);
  }

  private place(attempt: number) {
    const element = this.panel()?.nativeElement;
    const box = element?.getBoundingClientRect();
    if (!element || !box || box.height < 20) {
      if (attempt < 8) requestAnimationFrame(() => this.place(attempt + 1));
      return;
    }
    const roomAbove = box.top > box.height + 8;
    if (box.bottom > window.innerHeight - 8 && roomAbove) this.dropUp.set(true);
    else if (box.bottom > window.innerHeight - 8) element.scrollIntoView({ block: 'nearest' });
  }

  shift(step: number) {
    const [year, month] = this.view().split('-').map(Number);
    const next = new Date(year, month - 1 + (this.mode() === 'month' ? step * 12 : step), 1);
    this.view.set(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  }

  choose(value: string) {
    if (this.isAfterMax(value)) return;
    this.valueChange.emit(value);
    this.open.set(false);
  }

  @HostListener('document:click')
  close() {
    this.open.set(false);
  }

  private monthName(value: string, locale: string): string {
    const [year, month] = value.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }

  private isAfterMax(value: string): boolean {
    const limit = this.max();
    return !!limit && value.slice(0, limit.length) > limit;
  }
}

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
