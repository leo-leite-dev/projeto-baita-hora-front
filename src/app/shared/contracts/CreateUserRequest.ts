import { CreateUserProfileRequest } from "./CreateUserProfileRequest";

export interface CreateUserRequest {
  userEmail: string;
  username: string;
  rawPassword: string;
  profile: CreateUserProfileRequest;
}