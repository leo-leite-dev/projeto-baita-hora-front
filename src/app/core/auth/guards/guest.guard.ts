import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs';
import { SessionService } from '../../auth/services/session.service';

export const guestGuard: CanMatchFn = () => {
  const router = inject(Router);
  const session = inject(SessionService);

  return session.ensureReady$().pipe(
    switchMap(() => session.isAuthenticated$),
    filter(v => v !== null),
    take(1),
    map(isAuth => {
      if (!isAuth)
         return true;

      const companyId = session.currentCompanyId();
      return companyId
        ? router.createUrlTree(['/app/dashboard', companyId])
        : router.createUrlTree(['/app/select-company']);
    })
  );
};