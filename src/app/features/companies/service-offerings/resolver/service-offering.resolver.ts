import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ServiceOfferingsService } from '../services/service-offerings.service';

export const ServiceOfferingResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const api = inject(ServiceOfferingsService);
  const router = inject(Router);

  const id = route.paramMap.get('id')!;
  return api.getById(id).pipe(
    catchError(() => {
      router.navigate(['/service-offering/list']);
      return of(null);
    })
  );
};
