import { CreateAddressRequest, PatchAddressRequest } from "./address-request";

export interface CreateUserProfileRequest {
    fullName: string;
    cpf: string;
    rg?: string | null;
    phone: string;
    birthDate?: string | null;
    address: CreateAddressRequest;
}

export interface PatchUserProfileRequest {
    fullName?: string;
    birthDate?: string;
    phone?: string;
    cpf?: string;
    rg?: string;
    address?: PatchAddressRequest;
}