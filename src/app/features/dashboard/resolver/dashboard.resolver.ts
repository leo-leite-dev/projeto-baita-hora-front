import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { Appointment } from '../../schedules/appointments/models/appointments.models';

export const DashboardResolver: ResolveFn<Appointment[]> = () => {
  return of([]);
};