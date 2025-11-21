import { Appointment } from "../appointments/models/appointments.models";

export interface ScheduleDetails {
  scheduleId: string;
  memberName: string;
  positionName:string;
  memberId: string;
  appointments: Appointment[];
}