import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of, catchError } from 'rxjs';
import { DateUtil } from '../../../shared/utils/date.util';
import { Appointment } from '../../schedules/appointments/models/appointments.models';
import { AppointmentsService } from '../../schedules/services/appointments.service';

export const DashboardResolver: ResolveFn<Appointment[]> = () => {
  const service = inject(AppointmentsService);

  const today = DateUtil.todayYmdLocal();

  return service.getAll(today).pipe(
    catchError(() => of([]))
  );
};