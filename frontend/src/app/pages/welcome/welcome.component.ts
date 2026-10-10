import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { LanguageSelectComponent } from '../../components/language-select/language-select.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    LanguageSelectComponent
  ],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {}
