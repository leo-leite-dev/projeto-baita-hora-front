import { PositionBase } from "./position-base.model";
import { CompanyRole } from "../../../../shared/enums/company-role.enum";
import { ServiceOfferingOption } from "../../service-offerings/models/service-oferring-options.model";

export interface PositionEditView extends PositionBase {
    accessLevel: CompanyRole;
    serviceOfferings: ServiceOfferingOption[];
}