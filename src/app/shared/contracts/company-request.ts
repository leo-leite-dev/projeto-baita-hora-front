import { CreateAddressRequest } from "./address-request";

export interface CreateCompanyRequest {
    companyName: string;
    tradeName?: string | null;
    cnpj: string;
    companyPhone?: string;
    companyEmail?: string;
    address: CreateAddressRequest;
}