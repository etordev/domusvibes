import { Component, computed, ElementRef, HostListener, input, output, signal, viewChild } from '@angular/core';

export interface ChoiceOption {
  value: string;
  label: string;
  group?: string;
}

interface ChoiceGroup {
  label: string | null;
  options: ChoiceOption[];
}

@Component({
  selector: 'app-choice-field',
  standalone: true,
  templateUrl: './choice-field.component.html',
  styleUrl: './choice-field.component.scss'
})
export class ChoiceFieldComponent {
  readonly value = input('');
  readonly options = input<ChoiceOption[]>([]);
  readonly valueChange = output<string>();

  readonly open = signal(false);
  readonly dropUp = signal(false);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  readonly groups = computed<ChoiceGroup[]>(() => {
    const groups: ChoiceGroup[] = [];
    for (const option of this.options()) {
      const label = option.group ?? null;
      const last = groups.at(-1);
      if (last && last.label === label) last.options.push(option);
      else groups.push({ label, options: [option] });
    }
    return groups;
  });

  readonly currentLabel = computed(() =>
    this.options().find(option => option.value === this.value())?.label ?? ''
  );

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

  choose(value: string) {
    this.valueChange.emit(value);
    this.open.set(false);
  }

  @HostListener('document:click')
  close() {
    this.open.set(false);
  }
}
