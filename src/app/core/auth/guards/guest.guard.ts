import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { filter, map, switchMap, take, tap } from 'rxjs';
import { SessionService } from '../../auth/services/session.service';
import { AbilityService } from '../ability';

export const guestGuard: CanMatchFn = () => {
  const router = inject(Router);
  const session = inject(SessionService);
  const ability = inject(AbilityService);

  console.log('%c[guestGuard] >> rodou o guard', 'color: #4ea1ff');

  return session.ensureReady$().pipe(
    tap(() => console.log('%c[guestGuard] >> ensureReady$ completou', 'color: #6dd')),
    
    switchMap(() => session.isAuthenticated$),

    tap(v => console.log('%c[guestGuard] >> isAuthenticated$ emitiu:', 'color: #ff0', v)),

    filter(v => v !== null),

    take(1),

    map(isAuth => {
      console.log('%c[guestGuard] >> valor final do isAuthenticated:', 'color: #0f0', isAuth);

      if (!isAuth) {
        console.log('%c[guestGuard] >> liberando rota NORMALMENTE (user não autenticado)', 'color: #0f0');
        return true;
      }

      console.log('%c[guestGuard] >> usuário está autenticado segundo o estado interno do SessionService', 'color: #f55');

      const companyId = session.currentCompanyId();
      console.log('%c[guestGuard] >> companyId atual:', 'color: #faa', companyId);

      if (!companyId) {
        console.log('%c[guestGuard] >> sem companyId → /app/select-company', 'color: orange');
        return router.createUrlTree(['/app/select-company']);
      }

      if (ability.canViewDashboard()) {
        console.log('%c[guestGuard] >> canViewDashboard → redirecionando pra dashboard', 'color: cyan');
        return router.createUrlTree(['/app/dashboard', companyId]);
      }

      console.log('%c[guestGuard] >> fallback → redirecionando pra /app/my-schedule', 'color: pink');
      return router.createUrlTree(['/app/my-schedule']);
    })
  );
};
