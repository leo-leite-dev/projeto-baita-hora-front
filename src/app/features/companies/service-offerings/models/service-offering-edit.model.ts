import { ServiceOfferingBase } from "./service-offering-base.model";

export interface ServiceOfferingEditView extends ServiceOfferingBase {
    price: number;
    currency: string;
}