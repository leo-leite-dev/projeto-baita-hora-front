import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ErrorHandlingService } from '../../../shared/services/error-handling.service';
import { AuthenticateRequest } from '../models/authenticate-request.model';
import { AuthenticateResponse } from '../models/authenticate-response.model';
import { AuthResponse } from '../models/auth-response.model';
import { AuthContextService } from './auth-context.service';
import { CompanyRole } from '../../../shared/enums/company-role.enum';

export interface SelectCompanyRequest {
    companyId: string;
}

function decodeJwt<T = any>(token: string): T {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
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

    login(payload: AuthenticateRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.baseUrl}/login`, payload)
            .pipe(
                tap(auth => {
                    console.log('🔥 [AuthService.login] resp:', auth);

                    if (!auth.accessToken) {
                        console.log('⚠️ [AuthService.login] no accessToken in response');
                        return;
                    }

                    const decoded: any = decodeJwt(auth.accessToken);

                    console.log('🟡 [AuthService.login] Decoded JWT full:', decoded);
                    console.log('🔍 [AuthService.login] decoded.role:', decoded['role']);
                    console.log('🔍 [AuthService.login] decoded.companyRole:', decoded['companyRole']);
                    console.log('🔍 [AuthService.login] decoded.permissionMask:', decoded['permissionMask']);
                    console.log(
                        '🔍 [AuthService.login] decoded .NET role claims:',
                        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
                        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role']
                    );

                    // 1) tenta descobrir de onde vem a role no token
                    const rawRole: unknown =
                        decoded['companyRole'] ??
                        decoded['role'] ??
                        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
                        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];

                    console.log('🧾 [AuthService.login] rawRole from token:', rawRole);

                    // 2) converte essa rawRole para CompanyRole
                    let mappedRole: CompanyRole = CompanyRole.Viewer;

                    if (typeof rawRole === 'number') {
                        // enum numérico vindo direto (0, 1, 2, 3...)
                        mappedRole = rawRole as unknown as CompanyRole;
                    } else if (typeof rawRole === 'string') {
                        // pode ser "Owner", "Admin", etc.
                        if (CompanyRole[rawRole as keyof typeof CompanyRole] !== undefined) {
                            mappedRole = CompanyRole[rawRole as keyof typeof CompanyRole];
                        }
                    }

                    // 3) permissionMask se existir no token
                    const permissionMask: number =
                        typeof decoded['permissionMask'] === 'number'
                            ? decoded['permissionMask']
                            : 0;

                    console.log('🎯 [AuthService.login] mapped role:', mappedRole);
                    console.log('🎯 [AuthService.login] mapped permissionMask:', permissionMask);

                    // 4) memberId / companyId
                    const memberId: string =
                        decoded['memberId'] ??
                        decoded['sub'] ??
                        '';
                    const companyId: string = decoded['companyId'] ?? '';

                    console.log('🧩 [AuthService.login] memberId/companyId:', {
                        memberId,
                        companyId,
                    });

                    // 5) finalmente seta no AuthContext
                    this.authCtx.setAuth({
                        memberId,
                        companyId,
                        role: mappedRole,
                        permissionMask,
                        isAuthenticated: true,
                        // se teu AuthResponse tiver expiresAtUtc, manda pra lá que o AuthContext usa:
                        expiresAtUtc: (auth as any).expiresAtUtc,
                    });
                }),

                this.errorHandler.rxThrow('auth.login')
            );
    }

    logout(): Observable<void> {
        return this.http
            .post<void>(`${this.baseUrl}/logout`, {}, { observe: 'response' })
            .pipe(
                map(() => {
                    this.clearActiveCompany();
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
