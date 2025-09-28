import { CompanyRole } from "../../../../shared/enums/company-role.enum";

export interface PatchPositionRequest {
    newPositionName?: string | null;
    newAccessLevel?: CompanyRole | null;
    setServiceOfferingIds?: string[] | null;
}

export interface ActivatePositionsRequest {
    positionIds: string[];
}

export interface DisablePositionsRequest {
    positionIds: string[];
}

export interface RemoveServicesFromPositionRequest {
    serviceOfferingIds: string[];
}