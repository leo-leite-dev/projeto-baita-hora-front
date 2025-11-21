import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

    getMySchedule(): Observable<ScheduleDetails> {
        return this.http
            .get<ScheduleDetails>(`${this.api}/me`)
            .pipe(this.errors.rxThrow<ScheduleDetails>("SchedulesService.getMySchedule"));
    }

    getMemberSchedule(memberId: string, dateUtc?: string): Observable<ScheduleDetails> {
        const params: any = {};
        if (dateUtc) params.dateUtc = dateUtc;

        return this.http
            .get<ScheduleDetails>(`${this.api}/member/${memberId}`, { params })
            .pipe(this.errors.rxThrow<ScheduleDetails>('AppointmentsService.getMemberSchedule'));
    }
}