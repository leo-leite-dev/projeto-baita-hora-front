import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DateLabelPipe } from '../../../shared/pipes/date-label.pipe';
import { TimeFromUtcPipe } from '../../../shared/pipes/time-from-utc.pipe';
import { DateUtil } from '../../../shared/utils/date.util';
import { FaIconComponent } from '../../../shared/components/icons/fa-icon.component';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { MetricCardsComponent, MetricItem } from './components/metric-cards/metric-cards.component';
import { faCalendar, faDollarSign, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { Appointment } from '../../schedules/appointments/models/appointments.models';
import { AppointmentsService } from '../../schedules/services/appointments.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DateLabelPipe,
    TimeFromUtcPipe,
    FaIconComponent,     
    DatePickerComponent,
    MetricCardsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apptsSvc = inject(AppointmentsService);

  faCalendar = faCalendar;
  faDollarSign = faDollarSign;
  faMoneyBillWave = faMoneyBillWave;

  appointments = signal<Appointment[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  date = signal<string>(DateUtil.todayYmdLocal());
  totalToday = computed(() => this.appointments().length);
  companyId = signal<string | null>(null);

  ngOnInit(): void {
    const resolved = (this.route.snapshot.data['appointments'] as Appointment[]) ?? [];
    this.appointments.set(resolved);

    this.companyId.set(this.route.snapshot.paramMap.get('companyId'));
  }

  onDateChange(newDate: string | null) {
    if (!newDate) return;
    this.date.set(newDate);
    this.fetchForDate(newDate);
  }

  private fetchForDate(localYmd: string) {
    this.loading.set(true);
    this.error.set(null);

    this.apptsSvc.getAll(localYmd).subscribe({
      next: (list) => {
        this.appointments.set(Array.isArray(list) ? list : []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Falha ao carregar agendamentos.');
        this.loading.set(false);
      }
    });
  }

  get metricItems(): MetricItem[] {
    return [
      { faIcon: faCalendar, label: 'Agendamentos de hoje', value: this.totalToday() },
      { faIcon: faDollarSign, label: 'Faturamento do mês', value: this.totalToday() },
      { faIcon: faMoneyBillWave, label: 'Faturamento do dia', value: this.totalToday() },
    ];
  }
}