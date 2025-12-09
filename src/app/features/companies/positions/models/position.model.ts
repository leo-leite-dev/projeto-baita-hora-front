import { CompanyRole } from "../../../../shared/enums/company-role.enum";
import { ServiceOfferingOption } from "../../service-offerings/models/service-offering.model";
import { PositionBase } from "./position-base.model";

export interface Position extends PositionBase {
    accessLevel: CompanyRole;
    isActive: boolean;
    createdAtUtc: string;
    updatedAtUtc?: string;
    serviceOfferings: ServiceOfferingOption[];
}

export interface PositionEdit extends PositionBase {
    accessLevel: CompanyRole;
    serviceOfferings: ServiceOfferingOption[];
}

export interface PositionOptions extends PositionBase { }