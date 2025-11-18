import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { AuthContext as AuthCtxType } from './types';
import { CompanyRole } from '../../shared/enums/company-role.enum';

export type AuthState = AuthCtxType & { isAuthenticated: boolean };

const defaultAuth: AuthState = {
    memberId: '',
    companyId: '',
    role: CompanyRole.Viewer,
    permissionMask: 0,
    isAuthenticated: false,
};

const STORAGE_KEY = 'auth_ctx_v1';

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

    setAuth(next: Partial<AuthState> & { expiresAtUtc?: string } = {}) {
        const prev = this._state$.value;
        const merged = { ...prev, ...next };
        const isAuthenticated =
            typeof next.isAuthenticated === 'boolean'
                ? next.isAuthenticated
                : this.inferAuth(merged, next.expiresAtUtc);

        const finalState: AuthState = { ...merged, isAuthenticated };
        this._state$.next(finalState);
        this.saveToStorage({ ...finalState, expiresAtUtc: next.expiresAtUtc });
    }

    clearAuth() {
        this._state$.next(defaultAuth);
        this.removeFromStorage();
    }

    private hydrate(saved: any): AuthState {
        const { expiresAtUtc, ...rest } = saved || {};
        if (expiresAtUtc && this.isExpired(expiresAtUtc)) {
            this.removeFromStorage();
            return defaultAuth;
        }
        const base = { ...defaultAuth, ...rest } as AuthState;
        return { ...base, isAuthenticated: this.inferAuth(base, expiresAtUtc) };
    }

    private inferAuth(state: Partial<AuthState>, expiresAtUtc?: string | null): boolean {
        if (expiresAtUtc && this.isExpired(expiresAtUtc)) return false;
        return !!state.permissionMask || !!state.companyId || !!state.memberId || !!state.isAuthenticated;
    }

    private isExpired(expiresAtUtc?: string | null): boolean {
        if (!expiresAtUtc) return false;
        const exp = Date.parse(expiresAtUtc);
        if (Number.isNaN(exp)) return false;
        return Date.now() >= exp;
    }

    private hasWindow(): boolean {
        return typeof window !== 'undefined' && !!window.localStorage;
    }

    private saveToStorage(payload: any) {
        if (!this.hasWindow()) return;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { /* noop */ }
    }

    private getFromStorage(): any | null {
        if (!this.hasWindow()) return null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    private removeFromStorage() {
        if (!this.hasWindow()) return;
        try { localStorage.removeItem(STORAGE_KEY); } catch { }
    }
}