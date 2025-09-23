import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of, catchError } from 'rxjs';
import { GetAppointmentsResponse } from '../../appointments/models/appointments.models';
import { AppointmentsService } from '../../appointments/services/appointments.service';
import { DateUtil } from '../../../shared/utils/date.util';

export const DashboardResolver: ResolveFn<GetAppointmentsResponse[]> = () => {
  const service = inject(AppointmentsService);

  const today = DateUtil.todayYmdLocal();

  return service.getAll(today).pipe(
    catchError(() => of([]))
  );
};