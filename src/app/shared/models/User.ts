import { UserProfile } from "./UserProfile";

export interface UserBase {
  email: string;
  username: string;
  profile: UserProfile;
}

export interface User extends UserBase {
  rawPassword: string;
}

export interface UserDto extends UserBase { }