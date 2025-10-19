import { CompanyRole } from "../../../../shared/enums/company-role.enum";

export interface CreatePositionRequest {
    name: string;
    accessLevel: CompanyRole;
    serviceOfferingIds: string[];
}