import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,     
    TranslateModule   
  ],
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'de', 'fr', 'it', 'es']);
    translate.setDefaultLang('en');
    translate.use('en');
  }
}
