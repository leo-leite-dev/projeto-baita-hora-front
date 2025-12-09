import { CompanyRole } from "../../../../shared/enums/company-role.enum";

export interface CreatePositionRequest {
    name: string;
    accessLevel: CompanyRole;
    serviceOfferingIds: string[];
}

export interface PatchPositionRequest {
    name?: string | null;
    accessLevel?: keyof typeof CompanyRole | null;
    serviceOfferingIds?: string[] | null;
}

export interface DisablePositionsRequest {
    positionIds: string[];
}

export interface ActivatePositionsRequest {
    positionIds: string[];
}

export interface RemoveServicesFromPositionRequest {
    serviceOfferingIds: string[];
}