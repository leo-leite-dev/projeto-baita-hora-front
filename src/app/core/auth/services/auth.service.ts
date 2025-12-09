import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ErrorHandlingService } from '../../../shared/services/error-handling.service';
import { AuthenticateRequest } from '../contracts/authenticate-request.model';
import { AuthenticateResponse } from '../models/authenticate-response.model';
import { AuthResponse } from '../models/auth-response.model';
import { AuthContextService } from './auth-context.service';
import { PreLoginRequest } from '../contracts/pre-login-request';
import { PreLoginResponse } from '../models/pre-login-response.model';

export interface SelectCompanyRequest {
    companyId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
    private readonly errorHandler = inject(ErrorHandlingService);
    private readonly authCtx = inject(AuthContextService);

    private readonly ACTIVE_COMPANY_KEY = 'activeCompanyId';

    setActiveCompany(companyId: string): void {
        localStorage.setItem(this.ACTIVE_COMPANY_KEY, companyId);
    }

    getActiveCompany(): string | null {
        return localStorage.getItem(this.ACTIVE_COMPANY_KEY);
    }

    clearActiveCompany(): void {
        localStorage.removeItem(this.ACTIVE_COMPANY_KEY);
    }

    prelogin(payload: PreLoginRequest): Observable<PreLoginResponse> {
        return this.http
            .post<PreLoginResponse>(`${this.baseUrl}/prelogin`, payload)
            .pipe(
                this.errorHandler.rxThrow('auth.prelogin')
            );
    }

    login(payload: AuthenticateRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.baseUrl}/login`, payload)
            .pipe(
                tap(auth => this.authCtx.loginFromResponse(auth)),
                this.errorHandler.rxThrow('auth.login')
            );
    }

    logout(): Observable<void> {
        return this.http
            .post<void>(`${this.baseUrl}/logout`, {}, { observe: 'response' })
            .pipe(
                map(() => {
                    this.clearActiveCompany();
                    this.authCtx.clearAuth();
                    return void 0;
                }),
                this.errorHandler.rxThrow('auth.logout')
            );
    }

    me(): Observable<AuthenticateResponse> {
        return this.http
            .get<AuthenticateResponse>(`${this.baseUrl}/me`, { observe: 'response' })
            .pipe(
                map(res => res.body as AuthenticateResponse),
                this.errorHandler.rxThrow('auth.me')
            );
    }
}