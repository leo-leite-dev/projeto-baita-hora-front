import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs';
import { SessionService } from '../../auth/services/session.service';
import { AbilityService } from '../ability';

export const guestGuard: CanMatchFn = () => {
  const router = inject(Router);
  const session = inject(SessionService);
  const ability = inject(AbilityService);

  return session.ensureReady$().pipe(
    switchMap(() => session.isAuthenticated$),
    filter(v => v !== null),
    take(1),
    map(isAuth => {
      if (!isAuth)
        return true; 

      const companyId = session.currentCompanyId();

      if (!companyId) 
        return router.createUrlTree(['/app/select-company']);

      if (ability.canViewDashboard()) 
        return router.createUrlTree(['/app/dashboard', companyId]);
      
      return router.createUrlTree(['/app/my-schedule']);
    })
  );
};