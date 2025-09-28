import { Directive, EventEmitter, Output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';

@Directive({
    selector: '[appBulkSelect]',
    exportAs: 'appBulkSelect',
    standalone: true,
})
export class BulkSelectDirective<T = any> {
    selection = new SelectionModel<T>(true, []);
    bulkMode = false;

    @Output() bulkModeChange = new EventEmitter<boolean>();

    enter() {
        if (!this.bulkMode) {
            this.bulkMode = true;
            this.bulkModeChange.emit(true);
        }
    }

    exit() {
        if (this.bulkMode) {
            this.bulkMode = false;
            this.selection.clear();
            this.bulkModeChange.emit(false);
        }
    }

    isAllSelected(rows: readonly T[]) {
        return rows.length > 0 && this.selection.selected.length === rows.length;
    }

    masterToggle(rows: readonly T[]) {
        if (this.isAllSelected(rows)) {
            this.selection.clear();
        } else {
            this.selection.clear();
            this.selection.select(...rows); 
        }
    }

    toggleRow(row: T) {
        this.selection.toggle(row);
    }

    hasSelection() {
        return this.selection.hasValue();
    }

    selectedIds<Id extends string | number>(mapper: (it: T) => Id): Id[] {
        return this.selection.selected.map(mapper);
    }
}