import { Address } from "./Address";

export interface Company {
    companyName: string;
    cnpj: string;
    tradeName?: string;
    companyPhone: string;
    companyEmail: string;
    address: Address
}