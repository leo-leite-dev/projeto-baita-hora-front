import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { CompanyRole } from '../../../../shared/enums/company-role.enum';
import { PositionsService } from '../../positions/services/positions.service';
import { PositionEdit } from '../models/position.model';

function isCompanyRoleValue(value: unknown): value is CompanyRole {
  const values = Object.values(CompanyRole) as (string | number)[];

  return (
    (typeof value === 'number' || typeof value === 'string') &&
    values.includes(value as string | number)
  );
}

function toCompanyRole(v: unknown): CompanyRole {
  if (isCompanyRoleValue(v)) {
    return v;
  }

  if (
    typeof v === 'string' &&
    CompanyRole[v as keyof typeof CompanyRole] !== undefined
  )
    return CompanyRole[v as keyof typeof CompanyRole];


  return CompanyRole.Viewer;
}

export const PositionResolver: ResolveFn<PositionEdit | null> = (
  route: ActivatedRouteSnapshot,
) => {
  const service = inject(PositionsService);
  const id = route.paramMap.get('id') ?? '';

  return service.getById(id).pipe(
    map(res =>
      res ? { ...res, accessLevel: toCompanyRole(res.accessLevel) } : null,
    ),
    catchError(() => of(null)),
  );
};