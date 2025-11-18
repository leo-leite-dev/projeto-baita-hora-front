import { Appointment } from "../appointments/models/appointments.models";

export interface ScheduleDetails {
  scheduleId: string;
  memberId: string;
  appointments: Appointment[];
}