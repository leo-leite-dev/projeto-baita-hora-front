import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { RegisterOwnerWithCompanyRequest } from '../contracts/RegisterOwnerWithCompanyRequest';
import { RegisterOwnerWithCompanyResponse } from '../contracts/RegisterOwnerWithCompanyResponse';
import { ErrorHandlingService } from '../../../shared/services/error-handling.service';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiBaseUrl}/onboarding`;
    private readonly errorHandler = inject(ErrorHandlingService);

    registerOwnerWithCompany(
        payload: RegisterOwnerWithCompanyRequest
    ): Observable<RegisterOwnerWithCompanyResponse | void> {
        return this.http
            .post<RegisterOwnerWithCompanyResponse>(
                `${this.baseUrl}/register-owner`,
                payload,
                { observe: 'response' }
            )
            .pipe(
                map(res => res.body ?? undefined),
                this.errorHandler.rxThrow('registerOwnerWithCompany')
            );
    }
}