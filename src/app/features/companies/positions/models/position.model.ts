import { CompanyRole } from "../../../../shared/enums/company-role.enum";
import { ServiceOfferingOption } from "../../service-offerings/models/service-oferring-options.model";
import { PositionBase } from "./position-base.model";

export interface Position extends PositionBase {
    accessLevel: CompanyRole;
    isActive: boolean;
    createdAtUtc: string;
    updatedAtUtc?: string;
    serviceOfferings: ServiceOfferingOption[];
}