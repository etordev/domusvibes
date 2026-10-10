import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-select',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './language-select.component.html',
  styleUrl: './language-select.component.scss'
})
export class LanguageSelectComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly language = inject(LanguageService);
  readonly open = signal(false);
  readonly selected = computed(() =>
    this.language.languages.find(option => option.code === this.language.current()) ?? this.language.languages[0]
  );

  toggle() {
    this.open.update(open => !open);
  }

  pick(code: string) {
    this.language.use(code);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  closeFromOutside(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  close() {
    this.open.set(false);
  }
}
