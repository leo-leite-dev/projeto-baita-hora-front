import { CompanyRole } from './company-role.enum';

export const COMPANY_ROLE_NAMES = ['Unknown', 'Manager', 'Staff', 'Viewer'] as const;
export type CompanyRoleName = typeof COMPANY_ROLE_NAMES[number];

export const toRoleName = (v: CompanyRole | string): CompanyRoleName =>
    (typeof v === 'string' ? v : CompanyRole[v]) as CompanyRoleName;