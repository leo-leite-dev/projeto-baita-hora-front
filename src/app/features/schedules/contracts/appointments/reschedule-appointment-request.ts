export interface RescheduleAppointmentRequest {
  memberId: string;
  newStartsAtUtc: string;    
  newDurationMinutes: number;
}