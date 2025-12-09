import { CompanyRole } from "../../../shared/enums/company-role.enum";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  userId: string;
  username: { value: string };
  role: CompanyRole;
  companyId: string;
  permissionMask: number;
  memberId?: string;
  companies: { companyId: string; name: string }[];
}

export interface AuthCompanyResponse {
  companyId: string;
  name: string;
}