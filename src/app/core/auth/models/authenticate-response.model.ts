export interface AuthenticateResponse {
  isAuthenticated: boolean;
  userId: string | null;
  username: string | null;
  roles: string[];
}
