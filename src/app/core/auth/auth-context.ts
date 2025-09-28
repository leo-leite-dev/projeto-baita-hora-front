import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import type { AuthContext as AuthCtxType } from "./types";
import { CompanyRole } from "../../shared/enums/company-role.enum";

export type AuthState = AuthCtxType & { isAuthenticated: boolean };

const defaultAuth: AuthState = {
    companyId: "",
    role: CompanyRole.Viewer,
    permissionMask: 0,
    isAuthenticated: false,
};

@Injectable({ providedIn: "root" })
export class AuthContextService {
    private readonly _state$ = new BehaviorSubject<AuthState>(defaultAuth);
    readonly state$ = this._state$.asObservable();

    get snapshot(): AuthState {
        return this._state$.value;
    }

    setAuth(next: Partial<AuthState>) {
        const prev = this._state$.value;
        const inferredAuth =
            typeof next.isAuthenticated === "boolean"
                ? next.isAuthenticated
                : !!next.permissionMask || !!next.companyId;

        this._state$.next({
            ...prev,
            ...next,
            isAuthenticated: inferredAuth,
        });
    }

    clearAuth() {
        this._state$.next(defaultAuth);
    }
}