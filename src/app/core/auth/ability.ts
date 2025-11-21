import { inject, Injectable } from "@angular/core";
import { AuthContextService } from "./services/auth-context.service";
import { CompanyRole } from "../../shared/enums/company-role.enum";

export type PermissionKey = 'dashboard' | 'manage' | 'schedule';

@Injectable({ providedIn: "root" })
export class AbilityService {
    private auth = inject(AuthContextService);

    private permissionMap: Record<PermissionKey, (role: CompanyRole) => boolean> = {
        dashboard: (role) =>
            role === CompanyRole.Owner,

        manage: (role) =>
            role === CompanyRole.Owner || role === CompanyRole.Manager,

        schedule: () => true
    };

    isPermissionKey(value: any): value is PermissionKey {
        return ['dashboard', 'manage', 'schedule'].includes(value);
    }

    hasPermission(permission: PermissionKey): boolean {
        const role = this.auth.snapshot.role;
        return this.permissionMap[permission](role);
    }

    canViewDashboard() {
        return this.hasPermission('dashboard');
    }

    canManageCompany() {
        return this.hasPermission('manage');
    }
}