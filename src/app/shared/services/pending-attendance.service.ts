import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PendingAttendanceService {
    pendingUnknownTotal = signal(0);

    setTotal(total: number) {
        this.pendingUnknownTotal.set(total);
    }

    clear() {
        this.pendingUnknownTotal.set(0);
    }
}