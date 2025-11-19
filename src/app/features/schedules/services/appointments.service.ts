import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../appointments/models/appointments.models';
import { DateUtil } from '../../../shared/utils/date.util';
import { environment } from '../../../environments/environments';
import { ScheduleDetails } from '../models/schedule-deital';
import { ErrorHandlingService } from '../../../shared/services/error-handling.service';
import { CreateAppointmentRequest } from '../contracts/appointments/create-appointment-request.contract';
import { RescheduleAppointmentRequest } from '../contracts/appointments/reschedule-appointment-request';
import { CancelAppointmentRequest } from '../contracts/appointments/cancel-appointment-request';
import { UpdateAttendanceStatusRequest } from '../contracts/appointments/update-attendance-statu-request';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
    private http = inject(HttpClient);
    private errors = inject(ErrorHandlingService);

    private readonly baseUrl = '/api/appointments';
    private readonly api = `${environment.apiBaseUrl}/schedules/appointments`;

    createAppointment(payload: CreateAppointmentRequest) {
        return this.http
            .post<void>(`${this.api}`, payload)
            .pipe(this.errors.rxThrow<void>('AppointmentsService.create'));
    }

    rescheduleAppointment(appointmentId: string, payload: RescheduleAppointmentRequest) {
        return this.http
            .put<void>(`${this.api}/${appointmentId}/reschedule`, payload)
            .pipe(this.errors.rxThrow<void>('AppointmentsService.reschedule'));
    }

    cancelAppointment(appointmentId: string, payload: CancelAppointmentRequest) {
        return this.http
            .put<void>(`${this.api}/${appointmentId}/cancel`, payload)
            .pipe(this.errors.rxThrow<void>('AppointmentsService.cancel'));
    }

    updateAttendanceStatus(appointmentId: string, payload: UpdateAttendanceStatusRequest) {
        return this.http
            .put<void>(`${this.api}/${appointmentId}/attendance`, payload)
            .pipe(this.errors.rxThrow<void>('AppointmentsService.updateAttendanceStatus'));
    }

    getAll(localYmd?: string): Observable<Appointment[]> {
        let params: HttpParams | undefined;

        if (localYmd) {
            const iso = DateUtil.toIsoStartOfDay(localYmd);
            params = new HttpParams().set('date', iso);
        }

        return this.http.get<Appointment[]>(this.baseUrl, { params });
    }

    getMySchedule(): Observable<ScheduleDetails> {
        return this.http
            .get<ScheduleDetails>(`${this.api}/me`)
            .pipe(this.errors.rxThrow<ScheduleDetails>("SchedulesService.getMySchedule"));
    }
}