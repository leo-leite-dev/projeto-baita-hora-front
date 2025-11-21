import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompanyRole } from '../../../shared/enums/company-role.enum';

export type AuthState = {
    memberId: string;
    companyId: string;
    role: CompanyRole;
    permissionMask: number;
    isAuthenticated: boolean;
};

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
        console.log('🧊 AuthContextService ctor: creating service');

        const saved = this.getFromStorage();
        console.log('📦 AuthContextService ctor: loaded from storage:', saved);

        if (saved) {
            const next = this.hydrate(saved);
            console.log('💧 AuthContextService ctor: hydrated state:', next);
            this._state$.next(next);
        } else {
            console.log('📭 AuthContextService ctor: no saved auth, using defaultAuth:', defaultAuth);
        }
    }

    get snapshot(): AuthState {
        const value = this._state$.value;
        console.log('🔍 AuthContextService.snapshot getter:', value);
        return value;
    }

    setAuth(next: Partial<AuthState> & { expiresAtUtc?: string } = {}) {
        console.log('🔵 AuthContextService.setAuth called with:', next);

        const prev = this._state$.value;
        console.log('♻️ AuthContextService.setAuth previous state:', prev);

        const merged = { ...prev, ...next };
        console.log('🧮 AuthContextService.setAuth merged before inferAuth:', merged);
        console.log(
            '🎭 AuthContextService.setAuth role/permissionMask before inferAuth:',
            { role: merged.role, permissionMask: merged.permissionMask }
        );

        const isAuthenticated =
            typeof next.isAuthenticated === 'boolean'
                ? next.isAuthenticated
                : this.inferAuth(merged, next.expiresAtUtc);

        const finalState: AuthState = { ...merged, isAuthenticated };

        console.log('🟢 AuthContextService.setAuth final state:', finalState);

        this._state$.next(finalState);
        this.saveToStorage({ ...finalState, expiresAtUtc: next.expiresAtUtc });

        console.log(
            '📌 AuthContextService.setAuth saved to storage (with expiresAtUtc):',
            next.expiresAtUtc
        );
    }

    clearAuth() {
        console.log('🧹 AuthContextService.clearAuth called');
        this._state$.next(defaultAuth);
        this.removeFromStorage();
        console.log('🗑️ AuthContextService.clearAuth reset to defaultAuth and removed from storage');
    }

    private hydrate(saved: any): AuthState {
        console.log('💾 AuthContextService.hydrate called with:', saved);

        const { expiresAtUtc, ...rest } = saved || {};
        if (expiresAtUtc && this.isExpired(expiresAtUtc)) {
            console.log('⏰ AuthContextService.hydrate: token expired, clearing storage');
            this.removeFromStorage();
            return defaultAuth;
        }

        const base = { ...defaultAuth, ...rest } as AuthState;
        const hydrated: AuthState = {
            ...base,
            isAuthenticated: this.inferAuth(base, expiresAtUtc),
        };

        console.log('💧 AuthContextService.hydrate result:', hydrated);

        return hydrated;
    }

    private inferAuth(state: Partial<AuthState>, expiresAtUtc?: string | null): boolean {
        console.log('🧠 AuthContextService.inferAuth input:', { state, expiresAtUtc });

        if (expiresAtUtc && this.isExpired(expiresAtUtc)) {
            console.log('⛔ AuthContextService.inferAuth: expired token, returning false');
            return false;
        }

        const result =
            !!state.permissionMask ||
            !!state.companyId ||
            !!state.memberId ||
            !!state.isAuthenticated;

        console.log('✅ AuthContextService.inferAuth result:', result);

        return result;
    }

    private isExpired(expiresAtUtc?: string | null): boolean {
        if (!expiresAtUtc) {
            console.log('⌛ AuthContextService.isExpired: no expiresAtUtc, returning false');
            return false;
        }

        const exp = Date.parse(expiresAtUtc);

        if (Number.isNaN(exp)) {
            console.log(
                '⚠️ AuthContextService.isExpired: invalid expiresAtUtc, returning false. Value:',
                expiresAtUtc
            );
            return false;
        }

        const now = Date.now();
        const isExpired = now >= exp;

        console.log('⏱️ AuthContextService.isExpired:', { now, exp, isExpired });

        return isExpired;
    }

    private hasWindow(): boolean {
        const has = typeof window !== 'undefined' && !!window.localStorage;
        if (!has) {
            console.log('🚫 AuthContextService.hasWindow: window/localStorage not available');
        }
        return has;
    }

    private saveToStorage(payload: any) {
        if (!this.hasWindow()) return;
        try {
            console.log('💿 AuthContextService.saveToStorage payload:', payload);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (err) {
            console.log('❌ AuthContextService.saveToStorage error:', err);
        }
    }

    private getFromStorage(): any | null {
        if (!this.hasWindow()) return null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            console.log('📥 AuthContextService.getFromStorage raw:', raw);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.log('❌ AuthContextService.getFromStorage error:', err);
            return null;
        }
    }

    private removeFromStorage() {
        if (!this.hasWindow()) return;
        try {
            console.log('🧨 AuthContextService.removeFromStorage: removing key', STORAGE_KEY);
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.log('❌ AuthContextService.removeFromStorage error:', err);
        }
    }
}
