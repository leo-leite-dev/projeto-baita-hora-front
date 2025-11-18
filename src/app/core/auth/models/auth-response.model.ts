export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  userId: string;
  memberId?: string | null;
  username: string;
  roles: string[];
  companies: AuthCompanyResponse[];
}

export interface AuthCompanyResponse {
  companyId: string;
  name: string;
}