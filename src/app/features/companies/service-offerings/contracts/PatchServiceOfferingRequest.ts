export interface PatchServiceOfferingRequest {
    serviceOfferingName?: string;
    amount?: number;
    currency?: string;
}

export interface ActivateServiceOfferingsRequest {
    serviceOfferingIds: string[];
}

export interface DisableServiceOfferingsRequest {
    serviceOfferingIds: string[];
}