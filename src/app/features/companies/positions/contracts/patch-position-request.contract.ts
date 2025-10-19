import { CompanyRole } from "../../../../shared/enums/company-role.enum";

export interface PatchPositionRequest {
  name?: string | null;
  accessLevel?: keyof typeof CompanyRole | null; 
  serviceOfferingIds?: string[] | null;
}