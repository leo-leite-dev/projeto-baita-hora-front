import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, catchError, map, of, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private auth = inject(AuthService);
  private _ready$ = new BehaviorSubject(false);
  user$ = this.auth.me().pipe( // chama /auth/me; back valida cookie httpOnly
    catchError(() => of(null)),
    shareReplay(1)
  );

  isAuthenticated$ = this.user$.pipe(map(u => !!u));

  /** opcional: dispara uma vez no AppInit, se quiser “aquecer” a sessão */
  markReady() { this._ready$.next(true); }
}
