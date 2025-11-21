export interface CompanyStats {
    dayAppointmentsCount: number;
    monthAppointmentsCount: number;
    dayRevenue: number;
    monthRevenue: number;
    daySummary: AppointmentStatusSummary;
    monthSummary: MonthSummary;

    memberAppointments: MemberAppointment[];
}

export interface AppointmentStatusSummary {
    pending: number;
    attended: number;
    noShow: number;
    unknown: number;
    finished: number;
    cancelled: number;
}

export interface MonthSummary {
    unknown: number;
    cancelled: number;
}

export interface MemberAppointment {
    memberId: string;
    memberName: string;
    positionName: string;
    appointments: MemberAppointmentItem[];
}

export interface MemberAppointmentItem {
    id: string;
    status: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    serviceOfferingIds: string[];
    serviceOfferingNames: string[];
    attendanceStatus: string;
    startsAtUtc: string;
    endsAtUtc: string;
    durationMinutes: number;
}