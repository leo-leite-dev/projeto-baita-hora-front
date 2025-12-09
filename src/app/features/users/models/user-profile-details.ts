import { Address } from "../../../shared/models/Address";

export interface UserProfileDetails {
    fullName: string;
    cpf: string;
    rg?: string;
    birthDate?: string;
    phone: string;
    address: Address;
    profileImageUrl?: string | null;
}
