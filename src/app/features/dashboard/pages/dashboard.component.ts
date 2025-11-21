import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../shared/utils/date.util';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { MetricCardsComponent, MetricItem } from './components/metric-cards/metric-cards.component';
import { faCalendar, faDollarSign, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { Appointment } from '../../schedules/appointments/models/appointments.models';
import { AppointmentsService } from '../../schedules/services/appointments.service';
import { CompanyStatsService } from '../services/dashboard.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AttendanceDialogComponent, AttendanceDialogResult } from '../../schedules/modal/attendance/attendance-dialog.component';
import { catchError, filter, switchMap, tap, throwError } from 'rxjs';
import { AttendanceStatus } from '../../schedules/appointments/enums/attendance-status.enum';
import { UpdateAttendanceStatusRequest } from '../../schedules/contracts/appointments/update-attendance-statu-request';
import { TeamScheduleComponent } from './components/team-schedule/team-schedule.component'; // ajusta o path se precisar
import { CompanyStats, MemberAppointment } from '../../companies/company/model/company-stats';
import { PendingAttendanceService } from '../../../shared/services/pending-attendance.service';
import { ScheduleDetails } from '../../schedules/models/schedule-deital';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePickerComponent,
    MetricCardsComponent,
    MatDialogModule,
    TeamScheduleComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private appointmentService = inject(AppointmentsService);
  private statsService = inject(CompanyStatsService);
  private pendingAttendance = inject(PendingAttendanceService);
  private dialog = inject(MatDialog);

  faCalendar = faCalendar;
  faDollarSign = faDollarSign;
  faMoneyBillWave = faMoneyBillWave;

  appointments = signal<Appointment[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  date = signal<string>(DateUtil.todayYmdLocal());
  totalToday = computed(() => this.appointments().length);
  companyId = signal<string | null>(null);

  companyStats = signal<CompanyStats | null>(null);

  resetScheduleFilter = signal(0);

  memberSchedule = signal<ScheduleDetails | null>(null);

  memberAppointmentsFromSchedule = computed(() => {
    const s = this.memberSchedule();
    if (!s) 
      return [];

    return [
      {
        memberId: s.memberId,
        memberName: s.memberName,
        positionName: s.positionName,
        appointments: s.appointments
      }
    ];
  });

  get memberAppointmentsFromStats() {
    return this.companyStats()?.memberAppointments ?? [];
  }

  get daySummaryFromStats() {
    return this.companyStats()?.daySummary ?? null;
  }

  private currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  ngOnInit(): void {
    const resolved =
      (this.route.snapshot.data['appointments'] as Appointment[]) ?? [];
    this.appointments.set(resolved);

    this.companyId.set(this.route.snapshot.paramMap.get('companyId'));

    this.loadCompanyStats(this.date());
  }

  onDateChange(newDate: string | null) {
    if (!newDate)
      return;

    this.date.set(newDate);

    this.resetScheduleFilter.update(v => v + 1);

    this.loadCompanyStats(newDate);
  }

  private loadCompanyStats(localYmd?: string) {
    const dateUtc = localYmd ?? this.date();

    this.statsService.getStats(dateUtc).subscribe({
      next: stats => {
        this.companyStats.set(stats);

        const monthUnknown = stats?.monthSummary?.unknown ?? 0;
        this.pendingAttendance.setTotal(monthUnknown);
      },
      error: () => {
        this.companyStats.set(null);
        this.pendingAttendance.clear();
      }
    });
  }


  get metricItems(): MetricItem[] {
    const stats = this.companyStats();

    return [
      {
        faIcon: this.faCalendar,
        label: 'Agendamentos do dia',
        value: stats?.dayAppointmentsCount ?? '—'
      },
      {
        faIcon: this.faCalendar,
        label: 'Agendamentos do mês',
        value: stats?.monthAppointmentsCount ?? '—'
      },
      {
        faIcon: this.faMoneyBillWave,
        label: 'Faturamento do dia',
        value:
          stats?.dayRevenue != null
            ? this.currency.format(stats.dayRevenue)
            : '—'
      },
      {
        faIcon: this.faDollarSign,
        label: 'Faturamento do mês',
        value:
          stats?.monthRevenue != null
            ? this.currency.format(stats.monthRevenue)
            : '—'
      },
    ];
  }

  confirmAttendance(memberId: string, appointmentId: string) {
    const ref = this.dialog.open<
      AttendanceDialogComponent,
      void,
      AttendanceDialogResult
    >(AttendanceDialogComponent, {
      width: '420px',
      disableClose: true,
    });

    ref.afterClosed()
      .pipe(
        filter((result): result is AttendanceDialogResult =>
          result === 'attended' || result === 'noShow'
        ),
        switchMap((result) => {
          const attendanceStatus =
            result === 'attended'
              ? AttendanceStatus.Attended
              : AttendanceStatus.NoShow;

          const payload: UpdateAttendanceStatusRequest = {
            memberId,
            attendanceStatus,
          };

          return this.appointmentService.updateAttendanceStatus(appointmentId, payload);
        }),
        tap(() => {
          this.loadCompanyStats(this.date());
        }),
        catchError((err) => {
          this.error.set('Falha ao atualizar presença.');
          return throwError(() => err);
        }),
      )
      .subscribe();
  }
}