import { inject } from '@angular/core';
import { CanMatchFn, Router, Route } from '@angular/router';
import { AbilityService, PermissionKey } from '../ability';

export const permissionGuard: CanMatchFn = (route: Route) => {
    const router = inject(Router);
    const ability = inject(AbilityService);

    const raw = route?.data?.['permission'];

    if (!raw)
        return true;

    if (!ability.isPermissionKey(raw))
        return true;

    const required: PermissionKey = raw;

    const allowed = ability.hasPermission(required);

    if (allowed)
        return true;

    const currentUrl = router.url || '/';
    return router.parseUrl(currentUrl);
};