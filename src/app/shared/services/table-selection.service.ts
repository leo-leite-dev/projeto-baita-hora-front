import { Injectable, signal, computed } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { auditTime, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { HasIdActive, ActionLock, } from '../components/bulk-toolbar/models/bulk-selection.models';

export interface MixedRefinerDeps<T> {
    refineIfMixed: (
        dialog: MatDialog,
        selection: SelectionModel<T>,
        data: readonly T[],
    ) => Promise<ActionLock>;
    dialog: MatDialog;
    data: readonly T[];
    notify: (msg: string) => void;
}

@Injectable({ providedIn: 'root' })
export class TableSelectionService<T extends HasIdActive> {
    readonly baseColumns = signal<string[]>([]);
    readonly bulkMode = signal(false);

    private _selection = signal<SelectionModel<T> | null>(null);
    private selectionSub?: Subscription;
    private _selected = signal<readonly T[]>([]);

    get selected(): readonly T[] {
        return this._selected();
    }
    bindSelection(sel: SelectionModel<T> | null) {
        if (this._selection() === sel) return;

        this._selection.set(sel);
        this.selectionSub?.unsubscribe();
        this.selectionSub = undefined;

        if (sel) {
            this._selected.set(sel.selected.slice());

            this.selectionSub = sel.changed
                .pipe(auditTime(0))
                .subscribe(() => this._selected.set(sel.selected.slice()));
        } else {
            this._selected.set([]);
        }
    }

    unbindSelection() {
        this._selection.set(null);
        this.selectionSub?.unsubscribe();
        this.selectionSub = undefined;
        this._selected.set([]);
    }

    readonly columns = computed(() =>
        this.bulkMode() ? ['select', ...this.baseColumns()] : this.baseColumns()
    );

    readonly onlyActivesSelected = computed(() => {
        const sel = this._selected();
        return sel.length > 0 && sel.every(s => s.isActive);
    });

    readonly onlyInactivesSelected = computed(() => {
        const sel = this._selected();
        return sel.length > 0 && sel.every(s => !s.isActive);
    });

    readonly isMixed = computed(() => {
        const sel = this._selected();
        if (sel.length < 2) return false;
        const hasA = sel.some(s => s.isActive);
        const hasI = sel.some(s => !s.isActive);
        return hasA && hasI;
    });

    readonly isRefining = signal(false);

    readonly actionLock = computed<ActionLock>(() => {
        const sel = this._selected();
        if (sel.length === 0) return null;
        const allActive = sel.every(s => s.isActive);
        const allInactive = sel.every(s => !s.isActive);
        if (allActive) return 'disable';
        if (allInactive) return 'enable';
        return null;
    });

    async ensureRefinedIfMixed(deps: MixedRefinerDeps<T>): Promise<ActionLock> {
        if (!this.isMixed() || this.isRefining()) return null;

        const sel = this._selection();
        if (!sel) return null;

        this.isRefining.set(true);
        try {
            const lock = await deps.refineIfMixed(deps.dialog, sel, deps.data);
            if (!lock) return null;

            deps.notify(
                lock === 'disable'
                    ? 'Mantidos apenas ativos. Botão "Desativar" habilitado.'
                    : 'Mantidos apenas inativos. Botão "Ativar" habilitado.'
            );
            return lock;
        } finally {
            this.isRefining.set(false);
        }
    }
}