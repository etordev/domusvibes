import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';

export const authGuard: CanActivateFn = () => {
  if (typeof localStorage === 'undefined') return true;
  return inject(SessionService).token() ? true : inject(Router).createUrlTree(['/login']);
};
