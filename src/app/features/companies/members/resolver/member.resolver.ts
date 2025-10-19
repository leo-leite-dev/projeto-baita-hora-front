import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { MembersService } from '../../members/services/member.service';
import { MemberAdminEditView } from '../models/member-edit.model';

export const MemberResolver: ResolveFn<MemberAdminEditView | null> = (route: ActivatedRouteSnapshot) => {
  const service = inject(MembersService);
  const id = route.paramMap.get('id') ?? '';

  return service.getById(id).pipe(
    catchError(() => of(null))
  );
};