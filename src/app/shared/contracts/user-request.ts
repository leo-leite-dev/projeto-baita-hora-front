import { CreateUserProfileRequest, PatchUserProfileRequest } from "./user-profile-request";

export interface CreateUserRequest {
  email: string;
  username: string;
  rawPassword: string;
  profile: CreateUserProfileRequest;
}

export interface PatchUserRequest {
  email?: string;
  username?: string;
  profile?: PatchUserProfileRequest;
}