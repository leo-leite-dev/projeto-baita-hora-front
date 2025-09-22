import { CreateAddressRequest } from "./CreateAddressRequest";

export interface CreateUserProfileRequest {
    fullName: string;
    cpf: string;
    rg?: string | null;
    userPhone: string;
    birthDate?: string | null;
    address: CreateAddressRequest;
}