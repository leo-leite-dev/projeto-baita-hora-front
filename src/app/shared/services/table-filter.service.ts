import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Injectable({ providedIn: 'root' })
export class TableFilterService {
    applyFilter(ev: Event, dataSource: MatTableDataSource<any>, setter: (val: string) => void) {
        const v = (ev.target as HTMLInputElement).value || '';
        setter(v);
        dataSource.filter = v.trim().toLowerCase();
    }

    clearFilter(dataSource: MatTableDataSource<any>, setter: (val: string) => void) {
        setter('');
        dataSource.filter = '';
    }
}