import { Address } from "./Address";

export interface UserProfile {
    fullName: string;
    cpf: string;
    rg?: string;
    userPhone: string;
    birthDate?: string;
    address: Address;
}