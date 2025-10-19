import { CreateCompanyRequest } from "../../../shared/contracts/company-request";
import { CreateUserRequest } from "../../../shared/contracts/user-request";

export interface RegisterOwnerWithCompanyRequest {
  owner: CreateUserRequest;
  company: CreateCompanyRequest;
}