import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { map, filter, take } from 'rxjs';
import { SessionService } from '../../auth/services/session.service';

export const authGuard: CanMatchFn = () => {
    const router = inject(Router);
    const session = inject(SessionService);

    return session.isAuthenticated$.pipe(
        filter(v => v !== null && v !== undefined),
        take(1),
        map(isAuth => (isAuth ? true : router.createUrlTree(['/'])))
    );
};