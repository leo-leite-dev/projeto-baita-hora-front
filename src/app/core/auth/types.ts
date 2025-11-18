import { CompanyRole } from "../../shared/enums/company-role.enum";

export const CompanyPermission = {
    ManageMember: 1 << 0,
    ManageRoles: 1 << 1,
    ManageCompany: 1 << 2,
    EnableServiceOfferings: 1 << 3,
    DisableServiceOfferings: 1 << 4,
    DisablePositions: 1 << 5,
    RemoveMember: 1 << 6,
    RemoveServiceOfferings: 1 << 7,
    RemovePositions: 1 << 8,
} as const;

export type CompanyPermissionKey = keyof typeof CompanyPermission;

export type AuthContext = {
    memberId: string;         
    companyId: string;
    role: CompanyRole;
    permissionMask?: number;
};

export const hasPerm = (ctx: AuthContext, perm: CompanyPermissionKey) => {
    const mask = ctx.permissionMask ?? 0;
    const bit = CompanyPermission[perm];
    return (mask & bit) === bit;
};

export const canManageCompany = (ctx: AuthContext) =>
    hasPerm(ctx, "ManageCompany");

export const canCreateServiceOffering = (ctx: AuthContext) =>
    canManageCompany(ctx) || hasPerm(ctx, "EnableServiceOfferings");

export const canDisableServiceOffering = (ctx: AuthContext) =>
    canManageCompany(ctx) || hasPerm(ctx, "DisableServiceOfferings");

export const canRemoveServiceOffering = (ctx: AuthContext) =>
    canManageCompany(ctx) || hasPerm(ctx, "RemoveServiceOfferings");

export const canDisablePosition = (ctx: AuthContext) =>
    canManageCompany(ctx) || hasPerm(ctx, "DisablePositions");

export const canRemovePosition = (ctx: AuthContext) =>
    canManageCompany(ctx) || hasPerm(ctx, "RemovePositions");