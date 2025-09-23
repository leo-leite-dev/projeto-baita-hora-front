import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ErrorHandlingService } from '../../../shared/services/error-handling.service';
import { AuthenticateRequest } from '../models/authenticate-request.model';
import { AuthenticateResponse } from '../models/authenticate-response.model';
import { AuthResponse } from '../models/auth-response.model';

export interface SelectCompanyRequest {
    companyId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
    private readonly errorHandler = inject(ErrorHandlingService);

    login(payload: AuthenticateRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.baseUrl}/login`, payload, { observe: 'response' })
            .pipe(
                map(res => res.body as AuthResponse),
                this.errorHandler.rxThrow('auth.login')
            );
    }

    authenticate(): Observable<AuthenticateResponse> {
        return this.http
            .get<AuthenticateResponse>(`${this.baseUrl}/me`, { observe: 'response' })
            .pipe(
                map(res => res.body as AuthenticateResponse),
                this.errorHandler.rxThrow('auth.me')
            );
    }

    logout(): Observable<void> {
        return this.http
            .post<void>(`${this.baseUrl}/logout`, {}, { observe: 'response' })
            .pipe(
                map(() => void 0),
                this.errorHandler.rxThrow('auth.logout')
            );
    }

    selectCompany(payload: SelectCompanyRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.baseUrl}/select-company`, payload, { observe: 'response' })
            .pipe(
                map(res => res.body as AuthResponse),
                this.errorHandler.rxThrow('auth.selectCompany')
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