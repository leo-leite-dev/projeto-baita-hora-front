export interface CreateAppointmentRequest {
    memberId: string;
    customerId: string;
    serviceOfferingIds: string[];
    startsAtUtc: string;
    durationMinutes: number;
}
