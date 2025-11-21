import { CompanyRole } from "../../shared/enums/company-role.enum";
import { AuthState } from "./services/auth-context.service";

export const canViewDashboard = (ctx: AuthState) =>
  ctx.role === CompanyRole.Owner;

export const canManageCompany = (ctx: AuthState) =>
  ctx.role === CompanyRole.Owner || ctx.role === CompanyRole.Manager;