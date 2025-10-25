import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AuthenticateResponse } from '../models/authenticate-response.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private auth = inject(AuthService);

  private _user$ = new BehaviorSubject<AuthenticateResponse | null>(null);
  private _isAuth$ = new BehaviorSubject<boolean | null>(null); 
  private _ready$ = new BehaviorSubject<boolean>(false);
  private hydration$?: Observable<void>;

  readonly user$ = this._user$.asObservable();
  readonly isAuthenticated$ = this._isAuth$.asObservable();
  readonly ready$ = this._ready$.asObservable();

  userSnapshot(): AuthenticateResponse | null {
    return this._user$.value;
  }

  isAuthenticatedSnapshot(): boolean | null {
    return this._isAuth$.value;
  }

  private hydrate$(): Observable<void> {
    if (!this.hydration$) {
      this.hydration$ = this.auth.me().pipe(
        tap(user => {
          this._user$.next(user);
          this._isAuth$.next(true);
        }),
        catchError(err => {
          this._user$.next(null);
          this._isAuth$.next(false);
          return of(null);
        }),
        finalize(() => {
          this._ready$.next(true);
          this.hydration$ = undefined; 
        }),
        map(() => void 0),
        shareReplay(1)
      );
    }
    return this.hydration$;
  }

  ensureReady$(): Observable<void> {
    return this._ready$.value ? of(void 0) : this.hydrate$();
  }

  markAuthenticated(companyId?: string) {
    this._isAuth$.next(true);

    if (companyId) 
      this.auth.setActiveCompany(companyId);
    
    this.auth.me().pipe(take(1)).subscribe({
      next: user => this._user$.next(user),
      error: () => {},
      complete: () => this._ready$.next(true),
    });
  }

  clear() {
    this._user$.next(null);
    this._isAuth$.next(false);
    this._ready$.next(true); 
    this.auth.clearActiveCompany();
  }

  currentCompanyId(): string | null {
    return this.auth.getActiveCompany();
  }
}