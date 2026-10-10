import { afterNextRender, Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const APP_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' }
] as const;

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  readonly languages = APP_LANGUAGES;
  readonly current = signal('en');

  constructor() {
    this.translate.addLangs(this.languages.map(language => language.code));
    this.translate.setDefaultLang('en');
    this.translate.use('en');

    afterNextRender(() => {
      const saved = localStorage.getItem('lang');
      if (saved && saved !== 'en' && this.languages.some(language => language.code === saved)) {
        this.apply(saved, false);
      }
    });
  }

  use(code: string) {
    if (!this.languages.some(language => language.code === code) || code === this.current()) return;
    this.apply(code, true);
  }

  private apply(code: string, persist: boolean) {
    this.current.set(code);
    this.translate.use(code);
    document.documentElement.lang = code;
    if (persist) localStorage.setItem('lang', code);
  }
}
