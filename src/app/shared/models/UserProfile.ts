import { Address } from "./Address";

export interface UserProfile {
    fullName: string;
    cpf: string;
    rg?: string;
    phone: string;
    birthDate?: string;
    address: Address;
}