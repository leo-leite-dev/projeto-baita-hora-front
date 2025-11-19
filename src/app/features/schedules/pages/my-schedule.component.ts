import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventInput, EventDropArg, EventMountArg, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventResizeDoneArg } from '@fullcalendar/interaction';
import { of, throwError } from 'rxjs';
import { switchMap, tap, finalize, filter, catchError } from 'rxjs/operators';
import { AuthContextService } from '../../../core/auth';
import { AppointmentsService } from '../services/appointments.service';
import { CustomersService } from '../services/customer.service';
import { CreateAppointmentRequest } from '../contracts/appointments/create-appointment-request.contract';
import { RescheduleAppointmentRequest } from '../contracts/appointments/reschedule-appointment-request';
import { CancelAppointmentRequest } from '../contracts/appointments/cancel-appointment-request';
import { ToastrService } from 'ngx-toastr';
import { CreateAppointmentDialogComponent } from '../modal/create/create-appointment-dialog.component';
import { CancelAppointmentDialogComponent, CancelDialogResult } from '../modal/cancel/cancel-appointment.component';
import { FaIconComponent } from '../../../shared/components/icons/fa-icon.component';
import { AttendanceConfirmationService } from '../services/attendance-confirmation.service';
import { PendingListComponent } from '../menu/pending-list.component';
import { UpdateAttendanceStatusRequest } from '../contracts/appointments/update-attendance-statu-request';
import { AttendanceStatus } from '../appointments/enums/attendance-status.enum';

type DialogData = CreateAppointmentRequest;

type DialogResultExisting = {
  mode: 'existing';
  customerId: string;
  serviceOfferingIds: string[];
};

type DialogResultNew = {
  mode: 'new';
  customerName: string;
  customerCpf?: string;
  customerPhone?: string;
};

type DialogResult = DialogResultExisting | DialogResultNew;

type AppointmentStatusApi = 'Pending' | 'Cancelled' | 'Finished';
type AttendanceStatusApi = 'Unknown' | 'Attended' | 'NoShow';

type AppointmentStatusUI = 'pending' | 'canceled' | 'done' | 'noshow';

@Component({
  selector: 'app-my-schedule',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    MatDialogModule,
    FaIconComponent,
    PendingListComponent
  ],
  templateUrl: './my-schedule.component.html',
  styleUrls: ['./my-schedule.component.scss'],
})
export class MyScheduleComponent implements OnInit, OnDestroy {
  @ViewChild('cal') cal?: FullCalendarComponent;

  private customersService = inject(CustomersService);
  private appointmentsService = inject(AppointmentsService);
  private dialog = inject(MatDialog);
  private auth = inject(AuthContextService);
  private toastr = inject(ToastrService);
  private attendanceConfirmation = inject(AttendanceConfirmationService);

  isPendingAttendanceOpen = false;

  get pendingAttendanceCount(): number {
    return this.attendanceConfirmation.getPendingCount();
  }

  get pendingAttendanceItems(): EventInput[] {
    return this.attendanceConfirmation.getPendingList();
  }

  statusLegend = [
    { key: 'attending', label: 'Atendendo' },
    { key: 'pending', label: 'Pendente' },
    { key: 'done', label: 'Concluído' },
    { key: 'noshow', label: 'Não compareceu' },
  ];

  private refreshTimer?: any;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    locale: 'pt-br',
    timeZone: 'local',
    selectable: true,
    editable: true,
    eventDurationEditable: true,
    nowIndicator: true,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:30:00',
    scrollTime: '08:00:00',
    allDaySlot: false,
    slotDuration: '00:30:00',
    slotLabelInterval: '00:30:00',
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    eventDisplay: 'block',
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },

    eventDidMount: (arg: EventMountArg) => {
      const btn = arg.el.querySelector<HTMLButtonElement>('.slot-cancel');
      if (!btn) return;

      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.onClickCancelSlot(arg.event);
      });
    },

    eventClassNames: (arg) => {
      const status =
        (arg.event.extendedProps['status'] as AppointmentStatusUI) || 'pending';
      const classes = ['slot', `is-${status}`];

      const now = new Date();
      const start = arg.event.start as Date;
      const end =
        (arg.event.end as Date) ??
        new Date(
          start.getTime() +
          (((arg.event.extendedProps['durationMinutes'] as number) || 30) *
            60000),
        );

      if (now > end) classes.push('is-past');

      return classes;
    },

    eventContent: (arg) => {
      const time = arg.timeText || '';
      const name =
        (arg.event.extendedProps['customerName'] as string) || 'Cliente';
      const serviceNames =
        (arg.event.extendedProps['serviceOfferingNames'] as string[]) ?? [];
      const serviceTitle = serviceNames.join(', ');

      const status =
        (arg.event.extendedProps['status'] as AppointmentStatusUI) || 'pending';

      const now = new Date();
      const start = arg.event.start as Date;
      const end =
        (arg.event.end as Date) ??
        new Date(
          start.getTime() +
          (((arg.event.extendedProps['durationMinutes'] as number) || 30) *
            60000),
        );

      const isAttending = now >= start && now <= end;
      const isPast = now > end;

      let dotClass: string;
      if (status === 'noshow') dotClass = 'dot-noshow';
      else if (isAttending) dotClass = 'dot-attending';
      else if (isPast) dotClass = 'dot-done';
      else dotClass = 'dot-' + status;

      const canCancel =
        !isPast && status !== 'done' && status !== 'canceled' && status !== 'noshow';

      const cancelButtonHtml = canCancel
        ? `
          <button
            class="slot-cancel"
            type="button"
            data-app-id="${arg.event.id}"
            aria-label="Cancelar agendamento">
            ✕
          </button>
        `
        : '';

      return {
        html: `
        <div class="slot-wrap">
          <div class="slot-line1">
            <span class="slot-time">${time}</span>
            <span class="slot-sep">•</span>
            <span class="slot-name" title="${name}">${name}</span>
          </div>

          <div class="slot-line2">
            <span class="slot-service" title="${serviceTitle}">
              ${serviceTitle || '&nbsp;'}
            </span>
            <span class="slot-dot ${dotClass}"></span>
          </div>

          ${cancelButtonHtml}
        </div>
      `,
      };
    },

    selectAllow: (info) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = new Date(info.start);
      start.setHours(0, 0, 0, 0);

      return start >= today;
    },

    select: (arg) => {
      this.decorateSelection(arg);
      this.onSelectSlot(arg);
    },

    eventDrop: (arg) => this.onEventDrop(arg),
    eventResize: (arg) => this.onEventResize(arg),
  };

  ngOnInit(): void {
    setTimeout(() => this.loadMySchedule(), 500);

    this.refreshTimer = setInterval(() => {
      this.cal?.getApi().refetchEvents();
    }, 60_000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  private loadMySchedule(): void {
    this.appointmentsService.getMySchedule().subscribe({
      next: (s) => {
        const appts = Array.isArray(s) ? s : s?.appointments ?? [];

        const events: EventInput[] = appts
          .filter((a: any) => {
            const statusFromApi: AppointmentStatusApi =
              (a.status as AppointmentStatusApi | undefined) ?? 'Pending';

            return statusFromApi !== 'Cancelled';
          })
          .map((a: any) => {
            const appointmentStatus: AppointmentStatusApi =
              (a.status as AppointmentStatusApi | undefined) ?? 'Pending';

            const attendanceStatus: AttendanceStatusApi =
              (a.attendanceStatus as AttendanceStatusApi | undefined) ??
              'Unknown';

            let uiStatus: AppointmentStatusUI;
            if (appointmentStatus === 'Pending') uiStatus = 'pending';
            else uiStatus =
              attendanceStatus === 'NoShow' ? 'noshow' : 'done';

            const isLocked = appointmentStatus === 'Finished';

            return {
              id: a.id,
              title: '',
              start: a.startsAtUtc,
              end: a.endsAtUtc,
              editable: !isLocked,
              startEditable: !isLocked,
              durationEditable: !isLocked,
              extendedProps: {
                status: uiStatus,
                appointmentStatus,
                attendanceStatus,
                durationMinutes: a.durationMinutes,
                customerId: a.customerId,
                customerName: a.customerName,
                serviceOfferingIds: a.serviceOfferingIds ?? [],
                serviceOfferingNames: a.serviceOfferingNames ?? [],
              },
            };
          });

        const api = this.cal?.getApi();
        if (!api) return;

        api.removeAllEventSources();
        api.removeAllEvents();
        api.addEventSource(events);

        setTimeout(() => {
          this.attendanceConfirmation.process(events, () => this.loadMySchedule());
        }, 200);
      },
    });
  }

  togglePendingAttendance(): void {
    if (this.pendingAttendanceCount === 0)
      return;

    this.isPendingAttendanceOpen = !this.isPendingAttendanceOpen;
  }

  onPendingChoose(event: EventInput): void {
    this.isPendingAttendanceOpen = false;
    this.attendanceConfirmation.openAppointment(event, () =>
      this.loadMySchedule(),
    );
  }

  private decorateSelection(arg: DateSelectArg) {
    const api = this.cal?.getApi();
    if (!api) return;

    const label = api.formatRange(arg.start!, arg.end!, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const root = api.el as HTMLElement;
    root.querySelectorAll('.fc-highlight').forEach((el) => {
      (el as HTMLElement).setAttribute('data-range', label);
    });
  }

  private onEventDrop(arg: EventDropArg) {
    const event = arg.event;

    const appointmentStatus = event.extendedProps[
      'appointmentStatus'
    ] as AppointmentStatusApi | undefined;

    if (appointmentStatus === 'Finished') {
      this.toastr.info(
        'Não é possível mover um agendamento já finalizado.',
        'Atenção',
      );
      arg.revert();
      return;
    }

    const newStart = event.start;
    if (!newStart) {
      arg.revert();
      return;
    }

    const now = new Date();
    if (newStart < now) {
      this.toastr.warning(
        'Não é possível remarcar para um horário no passado.',
        'Atenção',
      );
      arg.revert();
      return;
    }

    const appointmentId = event.id;
    const memberId = this.getMemberIdAuthenticate();

    if (!memberId || !appointmentId) {
      arg.revert();
      return;
    }

    const end =
      event.end ??
      new Date(
        newStart.getTime() +
        (((event.extendedProps['durationMinutes'] as number) || 30) * 60000),
      );

    const newStartsAtUtc = newStart.toISOString();
    const newDurationMinutes = Math.max(
      1,
      Math.round((end.getTime() - newStart.getTime()) / 60000),
    );

    const payload: RescheduleAppointmentRequest = {
      memberId,
      newStartsAtUtc,
      newDurationMinutes,
    };

    this.appointmentsService
      .rescheduleAppointment(appointmentId, payload)
      .pipe(
        tap(() => {
          this.toastr.success('Agendamento remarcado com sucesso!');
          this.loadMySchedule();
        }),
        catchError((err) => {
          this.toastr.error('Não foi possível remarcar o agendamento.', 'Erro');
          arg.revert();
          return throwError(() => err);
        }),
      )
      .subscribe();
  }

  private onEventResize(arg: EventResizeDoneArg) {
    const event = arg.event;

    const appointmentStatus = event.extendedProps[
      'appointmentStatus'
    ] as AppointmentStatusApi | undefined;

    if (appointmentStatus === 'Finished') {
      this.toastr.info(
        'Não é possível alterar um agendamento já finalizado.',
        'Atenção',
      );
      arg.revert();
      return;
    }

    const newStart = event.start;
    const newEnd = event.end;

    if (!newStart || !newEnd) {
      arg.revert();
      return;
    }

    const now = new Date();
    if (newStart < now) {
      this.toastr.warning(
        'Não é possível alterar para um horário no passado.',
        'Atenção',
      );
      arg.revert();
      return;
    }

    const appointmentId = event.id;
    const memberId = this.getMemberIdAuthenticate();

    if (!memberId || !appointmentId) {
      arg.revert();
      return;
    }

    const newStartsAtUtc = newStart.toISOString();
    const newDurationMinutes = Math.max(
      1,
      Math.round((newEnd.getTime() - newStart.getTime()) / 60000),
    );

    const payload: RescheduleAppointmentRequest = {
      memberId,
      newStartsAtUtc,
      newDurationMinutes,
    };

    this.appointmentsService
      .rescheduleAppointment(appointmentId, payload)
      .pipe(
        tap(() => {
          this.toastr.success(
            'Duração do agendamento atualizada com sucesso!',
          );
          this.loadMySchedule();
        }),
        catchError((err) => {
          this.toastr.error(
            'Não foi possível atualizar a duração do agendamento.',
            'Erro',
          );
          arg.revert();
          return throwError(() => err);
        }),
      )
      .subscribe();
  }

  private onSelectSlot(selection: DateSelectArg) {
    const startsAtUtc = new Date(selection.start!).toISOString();
    const endsAtUtc = new Date(selection.end!).toISOString();
    const memberId = this.getMemberIdAuthenticate();
    if (!memberId) {
      this.cal?.getApi().unselect();
      return;
    }

    const durationMinutes = this.calcDurationMinutes(startsAtUtc, endsAtUtc);

    const initialPayload: CreateAppointmentRequest = {
      memberId,
      customerId: '',
      serviceOfferingIds: [],
      startsAtUtc,
      durationMinutes,
    };

    const ref = this.dialog.open<
      CreateAppointmentDialogComponent,
      DialogData,
      DialogResult | undefined
    >(CreateAppointmentDialogComponent, {
      width: '420px',
      disableClose: true,
      data: initialPayload,
    });

    ref
      .afterClosed()
      .pipe(
        tap((res) => {
          if (!res) this.cal?.getApi().unselect();
        }),
        filter((res): res is DialogResult => !!res),
        switchMap((res) => {
          if (res.mode === 'existing') {
            const customerId = res.customerId?.trim();
            const serviceOfferingIds = res.serviceOfferingIds ?? [];

            if (!customerId || serviceOfferingIds.length === 0) return of(null);

            const payload: CreateAppointmentRequest = {
              ...initialPayload,
              customerId,
              serviceOfferingIds,
            };

            return this.appointmentsService.createAppointment(payload).pipe(
              tap(() => this.loadMySchedule()),
              finalize(() => this.cal?.getApi().unselect()),
            );
          }

          return this.customersService
            .createCustomer({
              customerName: res.customerName,
              customerCpf: res.customerCpf ?? '',
              customerPhone: res.customerPhone ?? '',
            })
            .pipe(finalize(() => this.cal?.getApi().unselect()));
        }),
      )
      .subscribe();
  }

  private onClickCancelSlot(event: EventApi) {
    const appointmentId = event.id;
    const memberId = this.getMemberIdAuthenticate();

    if (!appointmentId || !memberId) {
      this.toastr.error('Não foi possível identificar o agendamento.', 'Erro');
      return;
    }

    const ref = this.dialog.open<
      CancelAppointmentDialogComponent,
      void,
      CancelDialogResult
    >(CancelAppointmentDialogComponent, {
      width: '420px',
      disableClose: true,
    });

    ref
      .afterClosed()
      .pipe(
        filter(
          (result): result is CancelDialogResult =>
            result === 'cancel' || result === 'noShow',
        ),
        switchMap((result) => {
          if (result === 'cancel') {
            const payload: CancelAppointmentRequest = { memberId };
            return this.appointmentsService.cancelAppointment(
              appointmentId,
              payload,
            );
          } else {
            const payload: UpdateAttendanceStatusRequest = {
              memberId,
              attendanceStatus: AttendanceStatus.NoShow, 
            };

            return this.appointmentsService.updateAttendanceStatus(
              appointmentId,
              payload,
            );
          }
        }),
        tap(() => {
          this.toastr.success('Agendamento atualizado com sucesso!');
          this.loadMySchedule();
        }),
        catchError((err) => {
          this.toastr.error(
            'Não foi possível atualizar o agendamento.',
            'Erro',
          );
          return throwError(() => err);
        }),
      )
      .subscribe();
  }

  private calcDurationMinutes(startIso: string, endIso: string) {
    const diff = new Date(endIso).getTime() - new Date(startIso).getTime();
    return Math.max(0, Math.round(diff / 60000));
  }

  private getMemberIdAuthenticate(): string {
    return this.auth.snapshot.memberId;
  }
}