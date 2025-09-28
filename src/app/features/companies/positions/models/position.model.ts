import { CompanyRole } from "../../../../shared/enums/company-role.enum";

type Uuid = string;

export interface ServiceDto {
    id: Uuid;
    name: string;
}

export interface Position {
    id: Uuid;
    name: string;
    accessLevel: CompanyRole;
    isActive: boolean;
    createdAtUtc: string;
    updatedAtUtc?: string;
    serviceOfferings: ServiceDto[];
}