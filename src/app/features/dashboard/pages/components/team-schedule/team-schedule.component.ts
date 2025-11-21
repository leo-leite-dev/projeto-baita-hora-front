import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, signal, input, OnChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeFromUtcPipe } from '../../../../../shared/pipes/time-from-utc.pipe';
import { AppointmentStatusSummary, MemberAppointment } from '../../../../companies/company/model/company-stats';
import { FaIconComponent } from '../../../../../shared/components/icons/fa-icon.component';
import { Autocomplete, SelectableItem } from '../../../../../shared/components/inputs/auto-complete/auto-complete.component';
import { MembersService } from '../../../../companies/members/services/member.service';
import { shareReplay } from 'rxjs';
import { MyScheduleComponent } from '../../../../schedules/pages/my-schedule.component';
import { ToggleViewButtonComponent } from '../../../../../shared/components/buttons/toggle-view-button/toggle-view-button.component';

type StatusFilter =
  | 'all'
  | 'pending'
  | 'finished'
  | 'attended'
  | 'noShow'
  | 'unknown'
  | 'cancelled';

type DaySummary = AppointmentStatusSummary;

type TeamScheduleView = 'team-appointment' | 'team-schedule';

interface StatusChip {
  key: StatusFilter;
  danger?: boolean;
  label: string;
}

interface ChipRule {
  key: StatusFilter;
  danger?: boolean;
  countKey?: keyof DaySummary;
  label: (s: DaySummary) => string;
}

@Component({
  selector: 'app-team-schedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TimeFromUtcPipe,
    FaIconComponent,
    ToggleViewButtonComponent,
    Autocomplete,
    MyScheduleComponent
  ],
  templateUrl: './team-schedule.component.html',
  styleUrls: ['./team-schedule.component.scss'],
})
export class TeamScheduleComponent implements OnChanges {
  private membersService = inject(MembersService);

  activeView: TeamScheduleView = 'team-appointment';

  setActiveView(view: TeamScheduleView) {
    this.activeView = view;
  }

  onToggleView(view: string) {
    this.setActiveView(view as TeamScheduleView);
  }

  memberAppointments = input.required<MemberAppointment[]>();
  daySummary = input<DaySummary | null>(null);

  @Output() confirmAttendance = new EventEmitter<{
    memberId: string;
    appointmentId: string;
  }>();

  @Output() memberSelected = new EventEmitter<string>();

  selectedStatus = signal<StatusFilter>('all');

  selectedMember: SelectableItem | null = null;
  selectedMemberId: string | null = null;

  memberOptions$ = this.membersService
    .listMemberOptions()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  private readonly CHIP_RULES: ChipRule[] = [
    {
      key: 'all',
      label: () => 'Todos',
    },
    {
      key: 'pending',
      countKey: 'pending',
      label: (s) => `${s.pending} pendente${s.pending > 1 ? 's' : ''}`,
    },
    {
      key: 'finished',
      countKey: 'finished',
      label: (s) => `${s.finished} finalizado${s.finished > 1 ? 's' : ''}`,
    },
    {
      key: 'attended',
      countKey: 'attended',
      label: (s) => `${s.attended} atendido${s.attended > 1 ? 's' : ''}`,
    },
    {
      key: 'noShow',
      countKey: 'noShow',
      label: (s) => `${s.noShow} no-show`,
    },
    {
      key: 'unknown',
      countKey: 'unknown',
      label: (s) => `${s.unknown} sem registro de presença`,
    },
    {
      key: 'cancelled',
      danger: true,
      countKey: 'cancelled',
      label: (s) => `${s.cancelled} cancelado${s.cancelled > 1 ? 's' : ''}`,
    },
  ];

  statusChips = computed<StatusChip[]>(() => {
    const s = this.daySummary();
    if (!s)
      return [];

    return this.CHIP_RULES.filter(
      (rule) => !rule.countKey || s[rule.countKey] > 0,
    ).map((rule) => ({
      key: rule.key,
      danger: rule.danger,
      label: rule.label(s),
    }));
  });

  filteredMemberAppointments = computed(() => {
    const status = this.selectedStatus();
    const members = this.memberAppointments() ?? [];

    if (status === 'all') return members;

    return members
      .map((m) => ({
        ...m,
        appointments: m.appointments.filter((a) => {
          switch (status) {
            case 'pending':
              return a.status === 'Pending';
            case 'finished':
              return a.status === 'Finished';
            case 'attended':
              return a.attendanceStatus === 'Attended';
            case 'noShow':
              return a.attendanceStatus === 'NoShow';
            case 'unknown':
              return (
                a.status === 'Finished' && a.attendanceStatus === 'Unknown'
              );
            case 'cancelled':
              return a.status === 'Cancelled';
            default:
              return true;
          }
        }),
      }))
      .filter((m) => m.appointments.length > 0);
  });

  ngOnChanges() {
    this.selectedStatus.set('all');
  }

  setStatusFilter(status: StatusFilter) {
    const current = this.selectedStatus();
    this.selectedStatus.set(current === status ? 'all' : status);
  }

  onConfirmAttendance(memberId: string, appointmentId: string) {
    this.confirmAttendance.emit({ memberId, appointmentId });
  }

  onMemberAutocompleteChange(value: SelectableItem | null) {
    this.selectedMember = value;

    if (!this.selectedMember) {
      this.selectedMemberId = null;
      this.memberSelected.emit('');
      return;
    }

    const id = String(this.selectedMember.id);
    this.selectedMemberId = id;
    this.memberSelected.emit(id);
  }
}