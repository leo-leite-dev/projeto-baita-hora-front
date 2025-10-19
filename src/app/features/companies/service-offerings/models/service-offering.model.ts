import { ServiceOfferingBase } from "./service-offering-base";

export interface ServiceOffering extends ServiceOfferingBase {
  price: number;
  currency: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string;
}