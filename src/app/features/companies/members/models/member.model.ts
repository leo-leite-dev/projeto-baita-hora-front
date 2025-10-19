export interface Member {
    id: string;
    name: string;
    phone: string;
    role: string;
    position: string;
    isActive: boolean;
    createdAtUtc: string;
    updatedAtUtc?: string;
    joinedAt: string;
}