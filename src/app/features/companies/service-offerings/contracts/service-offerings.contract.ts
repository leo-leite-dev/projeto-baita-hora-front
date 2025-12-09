export interface CreateServiceOfferingRequest {
    name: string;
    amount: number;
    currency: string;
}

export interface PatchServiceOfferingRequest {
    name?: string;
    amount?: number;
    currency?: string;
}

export interface ActivateServiceOfferingsRequest {
    serviceOfferingIds: string[];
}

export interface DisableServiceOfferingsRequest {
    serviceOfferingIds: string[];
}