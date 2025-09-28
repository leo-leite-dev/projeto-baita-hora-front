import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ErrorHandlingService } from "../../../../shared/services/error-handling.service";
import { CreateServiceOfferingRequest } from "../contracts/CreateServiceOfferingRequest";
import { CreateServiceOfferingResponse } from "../contracts/CreateServiceOfferingResponse";
import { ServiceOffering } from "../models/ServiceOffering.model";
import { ActivateServiceOfferingsRequest, DisableServiceOfferingsRequest, PatchServiceOfferingRequest } from "../contracts/PatchServiceOfferingRequest";

@Injectable({ providedIn: "root" })
export class ServiceOfferingsService {
    private readonly API = "/api/companies/service-offerings";

    constructor(
        private http: HttpClient,
        private errors: ErrorHandlingService
    ) { }

    listAll(): Observable<ServiceOffering[]> {
        return this.http
            .get<ServiceOffering[]>(this.API)
            .pipe(this.errors.rxThrow<ServiceOffering[]>("ServiceOfferingsService.list"));
    }

    getById(id: string): Observable<ServiceOffering> {
        return this.http
            .get<ServiceOffering>(`${this.API}/${id}`)
            .pipe(this.errors.rxThrow<ServiceOffering>("ServiceOfferingsService.getById"));
    }

    createServiceOffering(payload: CreateServiceOfferingRequest): Observable<CreateServiceOfferingResponse> {
        return this.http
            .post<CreateServiceOfferingResponse>(this.API, payload)
            .pipe(this.errors.rxThrow<CreateServiceOfferingResponse>("ServiceOfferingsService.create"));
    }

    patch(id: string, payload: PatchServiceOfferingRequest): Observable<void> {
        return this.http
            .patch<void>(`${this.API}/${id}`, payload)
            .pipe(this.errors.rxThrow<void>("ServiceOfferingsService.patch"));
    }

    activateMany(serviceOfferingIds: string[]): Observable<void> {
        const body: ActivateServiceOfferingsRequest = { serviceOfferingIds };
        return this.http
            .patch<void>(`${this.API}/activate`, body)
            .pipe(this.errors.rxThrow<void>("ServiceOfferingsService.activateMany"));
    }

    disableMany(serviceOfferingIds: string[]): Observable<void> {
        const body: DisableServiceOfferingsRequest = { serviceOfferingIds };
        return this.http
            .patch<void>(`${this.API}/disable`, body)
            .pipe(this.errors.rxThrow<void>("PositionsService.disableMany"));
    }

    delete(id: string): Observable<void> {
        return this.http
            .delete<void>(`${this.API}/${id}`)
            .pipe(this.errors.rxThrow<void>("ServiceOfferingsService.remove"));
    }
}