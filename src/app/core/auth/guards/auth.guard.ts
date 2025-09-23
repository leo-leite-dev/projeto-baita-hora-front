import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from '../../auth/services/session.service';

export const authGuard: CanMatchFn = () => {
    const router = inject(Router);
    const session = inject(SessionService);

    return session.isAuthenticated$.pipe(
        map(isAuth => isAuth ? true : router.createUrlTree(['/']))
    );
};