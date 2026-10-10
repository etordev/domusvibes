import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LogoutDialogComponent } from './logout-dialog.component';

@Injectable({ providedIn: 'root' })
export class LogoutPrompt {
  private dialog = inject(Dialog);
  private router = inject(Router);

  ask() {
    this.dialog.open<boolean>(LogoutDialogComponent, {
      role: 'alertdialog',
      ariaLabel: 'Log out',
      backdropClass: 'dv-dialog-backdrop',
      panelClass: 'dv-dialog-pane',
      autoFocus: 'first-tabbable',
      width: '420px',
      maxWidth: 'calc(100vw - 2rem)'
    }).closed.subscribe(confirmed => {
      if (!confirmed) return;
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      void this.router.navigate(['/']);
    });
  }
}
