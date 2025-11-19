import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environments";
import { ErrorHandlingService } from "../../../shared/services/error-handling.service";
import { CreateCustomerRequest } from "../contracts/customers/create-customer-request.contract";
import { CreateCustomerResponse } from "../contracts/customers/create-customer-response.contract";
import { CustomerOption } from "../models/customer-options.mode";

@Injectable({ providedIn: "root" })
export class CustomersService {
    private readonly api = `${environment.apiBaseUrl}/schedules/customers`;

    private http = inject(HttpClient);
    private errors = inject(ErrorHandlingService);

    createCustomer(payload: CreateCustomerRequest) {
        return this.http
            .post<CreateCustomerResponse>(`${this.api}`, payload)
            .pipe(this.errors.rxThrow<CreateCustomerResponse>('CustomersService.create'));
    }

    listCustomerOptions(search: string = "", take: number = 20): Observable<CustomerOption[]> {
        const params: Record<string, string> = {};
        if (search)
            params["search"] = search;

        if (take)
            params["take"] = String(take);

        return this.http
            .get<CustomerOption[]>(`${this.api}/customer-options`, { params })
            .pipe(this.errors.rxThrow<CustomerOption[]>("SchedulesService.listCustomerOptions"));
    }
}