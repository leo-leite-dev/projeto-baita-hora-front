import { CreateUserRequest } from "../../../../shared/contracts/user-request";

export interface RegisterEmployeeRequest {
    positionId: string;
    employee: CreateUserRequest;
}