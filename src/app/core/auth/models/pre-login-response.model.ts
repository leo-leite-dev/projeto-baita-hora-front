import { AuthCompanyResponse } from "./auth-response.model";

export interface PreLoginResponse {
    userId: string;
    username: string;
    companies: AuthCompanyResponse[];
}