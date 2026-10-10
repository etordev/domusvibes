import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// 🌍 ngx-translate
import { DialogModule } from '@angular/cdk/dialog';
import { TranslateModule, TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { authInterceptor } from './services/auth.interceptor';
import en from '../assets/i18n/en.json';
import es from '../assets/i18n/es.json';
import de from '../assets/i18n/de.json';
import it from '../assets/i18n/it.json';
import pt from '../assets/i18n/pt.json';
import fr from '../assets/i18n/fr.json';
import da from '../assets/i18n/da.json';
import nl from '../assets/i18n/nl.json';

const dictionaries: Record<string, TranslationObject> = { en, es, de, it, pt, fr, da, nl };

export class JsonTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of(dictionaries[lang] ?? dictionaries['en']);
  }
}

export function HttpLoaderFactory() {
  return new JsonTranslateLoader();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withNoIncrementalHydration()),
    provideHttpClient(withInterceptors([authInterceptor])),

    importProvidersFrom(
      DialogModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: []
        },
        useDefaultLang: true,
        defaultLanguage: 'en',
        fallbackLang: 'en'
      })
    )
  ]
};
