import { ServiceOfferingBase } from "./service-offering-base";

export interface ServiceOfferingEditView extends ServiceOfferingBase {
    price: number;
    currency: string;
}