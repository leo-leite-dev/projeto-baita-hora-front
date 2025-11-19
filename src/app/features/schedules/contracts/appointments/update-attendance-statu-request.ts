import { AttendanceStatus } from "../../appointments/enums/attendance-status.enum";

export interface UpdateAttendanceStatusRequest {
    memberId: string;
    attendanceStatus: AttendanceStatus
}