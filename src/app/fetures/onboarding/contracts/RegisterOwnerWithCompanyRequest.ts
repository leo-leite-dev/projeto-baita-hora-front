import { CreateCompanyRequest } from "../../../shared/contracts/CreateCompanyRequest";
import { CreateUserRequest } from "../../../shared/contracts/CreateUserRequest";

export interface RegisterOwnerWithCompanyRequest {
  owner: CreateUserRequest;
  company: CreateCompanyRequest;
}