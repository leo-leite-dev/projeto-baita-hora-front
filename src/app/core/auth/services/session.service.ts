import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, map, of, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private auth = inject(AuthService);

  user$ = this.auth.me().pipe(
    catchError(() => of(null)),
    shareReplay(1)
  );

  isAuthenticated$ = this.user$.pipe(map(u => !!u));

  currentCompanyId(): string | null {
    return this.auth.getActiveCompany();
  }

  markReady() { }
}