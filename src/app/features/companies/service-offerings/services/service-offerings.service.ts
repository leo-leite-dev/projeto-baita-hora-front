import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ErrorHandlingService } from "../../../../shared/services/error-handling.service";
import { environment } from "../../../../environments/environments";
import { ServiceOffering } from "../models/service-offering.model";
import { CreateServiceOfferingRequest } from "../contracts/create-service-offering.contract";
import { PatchServiceOfferingRequest } from "../contracts/patch-service-offering.contract";
import { ActivateServiceOfferingsRequest } from "../contracts/activate-service-offerings.contract";
import { DisableServiceOfferingsRequest } from "../contracts/disable-service-offerings.contract";
import { ServiceOfferingOption } from "../models/service-oferring-option.model";
import { ServiceOfferingEditView } from "../models/service-offering-edit.model";

@Injectable({ providedIn: "root" })
export class ServiceOfferingsService {
    private readonly api = `${environment.apiBaseUrl}/companies/service-offerings`;

    private http = inject(HttpClient);
    private errors = inject(ErrorHandlingService);

    listAll(): Observable<ServiceOffering[]> {
        return this.http
            .get<ServiceOffering[]>(this.api)
            .pipe(this.errors.rxThrow<ServiceOffering[]>("ServiceOfferingsService.list"));
    }

    getById(id: string): Observable<ServiceOfferingEditView> {
        return this.http
            .get<ServiceOffering>(`${this.api}/${id}`)
            .pipe(this.errors.rxThrow<ServiceOffering>("ServiceOfferingsService.getById"));
    }

    createServiceOffering(payload: CreateServiceOfferingRequest): Observable<void> {
        return this.http
            .post<void>(this.api, payload)
            .pipe(this.errors.rxThrow<void>("ServiceOfferingsService.create"));
    }

    patch(id: string, payload: PatchServiceOfferingRequest): Observable<void> {
        return this.http
            .patch<void>(`${this.api}/${id}`, payload)
            .pipe(this.errors.rxThrow<void>("ServiceOfferingsService.patch"));
    }

    activateMany(serviceOfferingIds: string[]): Observable<void> {
        const body: ActivateServiceOfferingsRequest = { serviceOfferingIds };
        return this.http
            .patch<void>(`${this.api}/activate`, body)
            .pipe(this.errors.rxThrow<void>("ServiceOfferingsService.activateMany"));
    }

    disableMany(serviceOfferingIds: string[]): Observable<void> {
        const body: DisableServiceOfferingsRequest = { serviceOfferingIds };
        return this.http
            .patch<void>(`${this.api}/disable`, body)
            .pipe(this.errors.rxThrow<void>("ServiceOfferingsService.disableMany"));
    }

    delete(id: string): Observable<void> {
        return this.http
            .delete<void>(`${this.api}/${id}`)
            .pipe(this.errors.rxThrow<void>("ServiceOfferingsService.remove"));
    }

    listServiceOfferingActiveOptions(
        search: string = "",
        take: number = 20
    ): Observable<ServiceOfferingOption[]> {
        const params: Record<string, string> = {};
        if (search)
            params["search"] = search;

        if (take)
            params["take"] = String(take);

        return this.http
            .get<ServiceOfferingOption[]>(`${this.api}/services-oferrings-options`, { params })
            .pipe(this.errors.rxThrow<ServiceOfferingOption[]>("ServiceOfferingsService.listActiveOptions"));
    }

    listServiceOfferingActiveOptionsForCurrentUser(
        search: string = "",
        take: number = 20
    ): Observable<ServiceOfferingOption[]> {
        const params: Record<string, string> = {};

        if (search)
            params["search"] = search;

        if (take)
            params["take"] = String(take);

        return this.http
            .get<ServiceOfferingOption[]>(`${this.api}/services-oferrings-options/my-options`, { params })
            .pipe(this.errors.rxThrow<ServiceOfferingOption[]>("ServiceOfferingsService.listActiveOptionsForCurrentUser"));
    }
}