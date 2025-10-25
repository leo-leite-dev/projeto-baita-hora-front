import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from '../../auth/services/session.service';

function buildUrl(segments: UrlSegment[]): string {
    const path = segments.map(s => s.path).join('/');
    return '/' + path;
}

export const authGuard: CanMatchFn = (_route, segments) => {
    const router = inject(Router);
    const session = inject(SessionService);

    return session.ensureReady$().pipe(
        map(() => {
            const isAuth = session.isAuthenticatedSnapshot() === true;
            if (isAuth) 
                return true;

            const attempted = buildUrl(segments);
            return router.createUrlTree(['/'], { queryParams: { redirect: attempted } });
        })
    );
};