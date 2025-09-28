// import { inject } from '@angular/core';
// import { ResolveFn, ActivatedRouteSnapshot, Router } from '@angular/router';
// import { catchError, of } from 'rxjs';
// import { PositionsService } from '../services/positions.service';

// export const PositionResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
//   const service = inject(PositionsService);
//   const router  = inject(Router);
//   const id = route.paramMap.get('id')!;

//   return service.getById(id).pipe(
//     catchError(() => {
//       router.navigate(['/position/list']);
//       return of(null);
//     })
//   );
// };