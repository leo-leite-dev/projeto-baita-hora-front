import { ServiceOfferingBase } from "./service-offering-base.model";

export interface ServiceOffering extends ServiceOfferingBase {
  price: number;
  currency: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface ServiceOfferingEdit extends ServiceOfferingBase {
  price: number;
  currency: string;
}

export interface ServiceOfferingOption extends ServiceOfferingBase { }