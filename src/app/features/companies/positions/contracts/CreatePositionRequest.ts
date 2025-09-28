import { CompanyRole } from "../../../../shared/enums/company-role.enum";

export interface CreatePositionRequest {
    positionName: string;
    accessLevel: CompanyRole;
    serviceOfferingIds: string[];
}