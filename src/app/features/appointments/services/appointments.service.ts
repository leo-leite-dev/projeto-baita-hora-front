import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetAppointmentsResponse } from '../models/appointments.models';
import { DateUtil } from '../../../shared/utils/date.util';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
    private http = inject(HttpClient);
    private readonly baseUrl = '/api/appointments';

    getAll(localYmd?: string): Observable<GetAppointmentsResponse[]> {
        let params: HttpParams | undefined;

        if (localYmd) {
            const iso = DateUtil.toIsoStartOfDay(localYmd);
            params = new HttpParams().set('date', iso);
        }

        return this.http.get<GetAppointmentsResponse[]>(this.baseUrl, { params });
    }
}