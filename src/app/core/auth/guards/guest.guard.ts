import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { SessionService } from '../../auth/services/session.service';
import { map, filter, take } from 'rxjs';

export const guestGuard: CanMatchFn = () => {
    const router = inject(Router);
    const session = inject(SessionService);

    return session.isAuthenticated$.pipe(
        filter(v => v !== null && v !== undefined),
        take(1),
        map(isAuth => {
            if (!isAuth)
                return true;

            const companyId = session.currentCompanyId();
            if (!companyId)
                throw new Error('Invariant violated: authenticated user without companyId');

            return router.createUrlTree(['/app/dashboard', companyId]);
        })
    );
};