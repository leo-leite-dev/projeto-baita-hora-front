import { MemberBase } from "./member-base";

export interface Member extends MemberBase {
    phone: string;
    role: string;
    position: string;
    isActive: boolean;
    createdAtUtc: string;
    updatedAtUtc?: string;
    joinedAt: string;
}