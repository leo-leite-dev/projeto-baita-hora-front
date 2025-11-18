export interface AuthenticateResponse {
  isAuthenticated: boolean;
  userId: string;
  username: string;
  roles: string[];
}