export interface Appointment {
    id: string;
    status: string;
    customerName: string;
    customerPhone: string;
    serviceOfferingName: string;
    customerId: string;
    serviceOfferingId: string;
    startsAtUtc: string;
    endsAtUtc: string;
    durationMinutes: number;
}