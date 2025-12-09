import { CreateUserRequest } from "../../../../shared/contracts/user-request";

export interface RegisterEmployeeRequest {
    positionId: string;
    employee: CreateUserRequest;
}

export interface PatchEmployeeRequest {
    email?: string;
    cpf?: string;
    rg?: string;
}

export interface ActivateEmployeesRequest {
    memberIds: string[];
}

export interface DisableEmployeesRequest {
    memberIds: string[];
}

export interface ChangeMemberPositionRequest {
    positionId: string;
    alignRoleToPosition?: boolean;
}