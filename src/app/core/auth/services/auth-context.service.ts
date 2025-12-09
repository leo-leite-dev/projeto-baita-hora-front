import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompanyRole } from '../../../shared/enums/company-role.enum';
import { AuthResponse } from '../models/auth-response.model';

export type AuthState = {
    memberId: string;
    username: string;
    companyId: string;
    role: CompanyRole;
    permissionMask: number;
    isAuthenticated: boolean;
    expiresAtUtc?: string | null;
};

const defaultAuth: AuthState = {
    memberId: '',
    username: '',
    companyId: '',
    role: CompanyRole.Viewer,
    permissionMask: 0,
    isAuthenticated: false,
    expiresAtUtc: null,
};

const STORAGE_KEY = 'auth_ctx_v2';

@Injectable({ providedIn: 'root' })
export class AuthContextService {
    private readonly _state$ = new BehaviorSubject<AuthState>(defaultAuth);
    readonly state$ = this._state$.asObservable();

    constructor() {
        const saved = this.getFromStorage();

        if (saved) {
            const next = this.hydrate(saved);
            this._state$.next(next);
        }
    }

    get snapshot(): AuthState {
        return this._state$.value;
    }

    loginFromResponse(auth: AuthResponse): void {
        this.setAuth({
            memberId: auth.memberId,
            username: auth.username.value,
            companyId: auth.companyId,
            role: auth.role,
            permissionMask: auth.permissionMask ?? 0,
            isAuthenticated: true,
            expiresAtUtc: auth.expiresAtUtc,
        });
    }

    setAuth(next: Partial<AuthState> = {}) {
        const prev = this._state$.value;

        const merged: AuthState = {
            ...prev,
            ...next,
        };

        const finalState: AuthState = {
            ...merged,
            isAuthenticated: this.inferAuth(merged),
        };

        this._state$.next(finalState);
        this.saveToStorage(finalState);
    }

    clearAuth() {
        this._state$.next(defaultAuth);
        this.removeFromStorage();
    }

    private hydrate(saved: any): AuthState {
        const base = { ...defaultAuth, ...saved } as AuthState;

        if (base.expiresAtUtc && this.isExpired(base.expiresAtUtc)) {
            this.removeFromStorage();
            return defaultAuth;
        }

        const hydrated: AuthState = {
            ...base,
            isAuthenticated: this.inferAuth(base),
        };

        return hydrated;
    }

    private inferAuth(state: Partial<AuthState>): boolean {
        if (state.expiresAtUtc && this.isExpired(state.expiresAtUtc)) {
            return false;
        }

        const result =
            !!state.permissionMask ||
            !!state.companyId ||
            !!state.memberId ||
            !!state.isAuthenticated;

        return result;
    }

    private isExpired(expiresAtUtc?: string | null): boolean {
        if (!expiresAtUtc)
            return false;

        const exp = Date.parse(expiresAtUtc);

        if (Number.isNaN(exp))
            return false;

        const now = Date.now();
        const isExpired = now >= exp;

        return isExpired;
    }

    private hasWindow(): boolean {
        const has = typeof window !== 'undefined' && !!window.localStorage;
        if (!has) { }
        return has;
    }

    private saveToStorage(payload: AuthState) {
        if (!this.hasWindow())
            return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (err) { }
    }

    private getFromStorage(): any | null {
        if (!this.hasWindow())
            return null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            return null;
        }
    }

    private removeFromStorage() {
        if (!this.hasWindow())
            return;
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) { }
    }
}