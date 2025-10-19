export interface ChangeMemberPositionResponse {
    memberId: string;
    oldPositionId: string | null;
    newPositionId: string;
    accessLevel: string;
    roleAligned: boolean;
}