import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LogoutDialogComponent } from './logout-dialog.component';
import { SessionService } from '../../services/session.service';

@Injectable({ providedIn: 'root' })
export class LogoutPrompt {
  private dialog = inject(Dialog);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private session = inject(SessionService);

  ask() {
    this.dialog.open<boolean>(LogoutDialogComponent, {
      role: 'alertdialog',
      ariaLabel: this.translate.instant('Logout.Aria'),
      backdropClass: 'dv-dialog-backdrop',
      panelClass: 'dv-dialog-pane',
      autoFocus: 'first-tabbable',
      width: '420px',
      maxWidth: 'calc(100vw - 2rem)'
    }).closed.subscribe(confirmed => {
      if (!confirmed) return;
      this.session.clear();
      void this.router.navigate(['/']);
    });
  }
}
