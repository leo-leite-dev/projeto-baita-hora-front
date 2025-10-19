import { Injectable } from '@angular/core';
import { ServiceOffering } from '../models/service-offering.model';
import { BaseActivableFacade } from '../../../../shared/facades/base-activable.facade';
import { ServiceOfferingsService } from '../services/service-offerings.service';

@Injectable({ providedIn: 'root' })
export class ServiceOfferingsFacade extends BaseActivableFacade<ServiceOffering> {
    constructor(api: ServiceOfferingsService) {
        super(api);
    }
}