import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ErrorHandlingService } from '../../../shared/services/error-handling.service';
import { CompanyStats } from '../../companies/company/model/company-stats';

@Injectable({ providedIn: 'root' })
export class CompanyStatsService {
    private readonly statsUrl = `${environment.apiBaseUrl}/schedules/stats`;

    private http = inject(HttpClient);
    private errors = inject(ErrorHandlingService);

    getStats(dateUtc?: string): Observable<CompanyStats> {
        const params: any = {};

        if (dateUtc)
            params.dateUtc = dateUtc;

        return this.http
            .get<CompanyStats>(this.statsUrl, { params })
            .pipe(this.errors.rxThrow<CompanyStats>('CompanyStatsService.getStats'));
    }
}