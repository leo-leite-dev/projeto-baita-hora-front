import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { CompanyRole } from '../../../../shared/enums/company-role.enum';
import { PositionsService } from '../../positions/services/positions.service';
import { PositionEditView } from '../models/position-edit-view.model';


function toCompanyRole(v: unknown): CompanyRole {
  if (typeof v === 'number' && CompanyRole[v] !== undefined)
    return v as CompanyRole;

  if (typeof v === 'string' && CompanyRole[v as keyof typeof CompanyRole] !== undefined)
    return CompanyRole[v as keyof typeof CompanyRole];

  return CompanyRole.Viewer;
}


export const PositionResolver: ResolveFn<PositionEditView | null> = (route: ActivatedRouteSnapshot) => {
  const service = inject(PositionsService);
  const id = route.paramMap.get('id') ?? '';

  return service.getById(id).pipe(
    map(res => res ? { ...res, accessLevel: toCompanyRole(res.accessLevel) } : null),
    catchError(() => of(null))
  );
};