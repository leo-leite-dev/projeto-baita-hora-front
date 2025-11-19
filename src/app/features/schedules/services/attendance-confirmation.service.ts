import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { EventInput } from '@fullcalendar/core';
import { AppointmentsService } from './appointments.service';
import { AuthContextService } from '../../../core/auth';
import { AttendanceStatus } from '../appointments/enums/attendance-status.enum';
import { AttendanceDialogComponent } from '../modal/attendance/attendance-dialog.component';
import { UpdateAttendanceStatusRequest } from '../contracts/appointments/update-attendance-statu-request';
import { filter, switchMap, tap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

type AttendanceDialogResult = 'attended' | 'noShow' | 'later';

type AppointmentStatusApi = 'Pending' | 'Cancelled' | 'Finished';
type AttendanceStatusApi = 'Unknown' | 'Attended' | 'NoShow';

@Injectable({ providedIn: 'root' })
export class AttendanceConfirmationService {
    private dialog = inject(MatDialog);
    private appointmentsService = inject(AppointmentsService);
    private auth = inject(AuthContextService);
    private toastr = inject(ToastrService);

    private pendingAttendance: EventInput[] = [];
    private isDialogOpen = false;

    getPendingCount(): number {
        return this.pendingAttendance.length;
    }

    getPendingList(): EventInput[] {
        return [...this.pendingAttendance];
    }

    process(events: EventInput[], onUpdated: () => void): void {
        const pendings = events.filter((e) => {
            const apptStatus = e.extendedProps?.['appointmentStatus'] as AppointmentStatusApi | undefined;
            const attendance = e.extendedProps?.['attendanceStatus'] as AttendanceStatusApi | undefined;

            return (
                apptStatus === 'Finished' &&
                (!attendance || attendance === 'Unknown')
            );
        });

        this.pendingAttendance = pendings;

        const recent = this.getMostRecentPendingWithinWindow(30);

        if (recent)
            this.openAppointment(recent, onUpdated);
    }

    private getMostRecentPendingWithinWindow(maxMinutes: number): EventInput | null {
        if (this.pendingAttendance.length === 0)
            return null;

        const nowMs = Date.now();
        const maxMs = maxMinutes * 60 * 1000;

        const candidates = this.pendingAttendance
            .map((ev) => {
                const start = ev.start
                    ? new Date(ev.start as string | Date)
                    : null;

                if (!start)
                    return null;

                let end: Date;

                if (ev.end) {
                    end = new Date(ev.end as string | Date);
                } else {
                    const duration =
                        (ev.extendedProps?.['durationMinutes'] as number | undefined) ?? 30;
                    end = new Date(start.getTime() + duration * 60000);
                }

                const diff = nowMs - end.getTime();

                return { ev, diff };
            })
            .filter(
                (x): x is { ev: EventInput; diff: number } =>
                    !!x && x.diff >= 0 && x.diff <= maxMs,
            );

        if (candidates.length === 0)
            return null;

        candidates.sort((a, b) => a.diff - b.diff);

        return candidates[0].ev;
    }

    openFirstPending(onUpdated: () => void): void {
        if (this.isDialogOpen)
            return;

        if (this.pendingAttendance.length === 0)
            return;

        const next = this.pendingAttendance[0];
        this.openAppointment(next, onUpdated);
    }

    openAppointment(appointment: EventInput, onUpdated: () => void): void {
        if (this.isDialogOpen)
            return;

        const nextId = appointment.id as string | undefined;
        if (!nextId)
            return;

        this.isDialogOpen = true;

        const ref = this.dialog.open<
            AttendanceDialogComponent,
            { appointment: EventInput },
            AttendanceDialogResult
        >(AttendanceDialogComponent, {
            width: '400px',
            disableClose: true,
            data: { appointment },
        });

        ref
            .afterClosed()
            .pipe(
                tap(() => (this.isDialogOpen = false)),
                filter(
                    (result): result is AttendanceDialogResult =>
                        !!result && result !== 'later',
                ),
                switchMap((result) => {
                    const memberId = this.auth.snapshot.memberId;
                    if (!memberId) {
                        this.toastr.error(
                            'Não foi possível identificar o profissional.',
                            'Erro',
                        );

                        return of(null);
                    }

                    const payload: UpdateAttendanceStatusRequest = {
                        memberId,
                        attendanceStatus:
                            result === 'attended'
                                ? AttendanceStatus.Attended
                                : AttendanceStatus.NoShow,
                    };

                    return this.appointmentsService
                        .updateAttendanceStatus(nextId, payload)
                        .pipe(
                            tap(() => {
                                this.toastr.success(
                                    'Status de atendimento registrado com sucesso!',
                                );
                                this.pendingAttendance = this.pendingAttendance.filter(
                                    (p) => p.id !== nextId,
                                );
                                onUpdated();
                            }),
                            catchError((err) => {
                                this.toastr.error(
                                    'Não foi possível atualizar o status de atendimento.',
                                    'Erro',
                                );
                                return throwError(() => err);
                            }),
                        );
                }),
            )
            .subscribe();
    }
}