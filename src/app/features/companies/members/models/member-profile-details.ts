import { UserDto } from "../../../../shared/models/User";

export interface MemberProfileDetails {
  id: string;
  role: string;
  position?: string | null;
  isActive: boolean;
  joinedAt: string; 
  user: UserDto;
}
