import { UserProfile } from "./UserProfile";

export interface User {
  userEmail: string;
  username: string;
  rawPassword: string;
  profile: UserProfile;
}