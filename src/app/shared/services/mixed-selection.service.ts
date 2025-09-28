import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { firstValueFrom } from 'rxjs';
import { HasIdActive, ActionLock, RefineChoice, BulkSelectionData } from '../components/bulk-toolbar/models/bulk-selection.models';
import { BulkSelectionDialogComponent } from '../components/bulk-toolbar/modal/bulk-selection-dialog.component';

@Injectable({ providedIn: 'root' })
export class MixedSelectionService {
    isMixed<T extends HasIdActive>(selection: SelectionModel<T>): boolean {
        const sel = selection.selected;

        if (sel.length < 2)
            return false;

        const hasActive = sel.some(s => s.isActive);
        const hasInactive = sel.some(s => !s.isActive);
        return hasActive && hasInactive;
    }

    async refineIfMixed<T extends HasIdActive>(
        dialog: MatDialog,
        selection: SelectionModel<T>,
    ): Promise<ActionLock> {
        const selected = selection.selected ?? [];
        if (selected.length < 2) return null;

        const hasActive = selected.some(s => s.isActive);
        const hasInactive = selected.some(s => !s.isActive);
        if (!hasActive || !hasInactive) return null;

        const ref = dialog.open<
            BulkSelectionDialogComponent,
            BulkSelectionData,
            RefineChoice
        >(BulkSelectionDialogComponent, {
            disableClose: true,
            data: {
                selectionCount: selected.length,
            },
            width: '520px',
            panelClass: 'refine-dialog-panel',
            backdropClass: 'refine-dialog-backdrop',
            autoFocus: false,
            restoreFocus: false,
        });

        const choice = await firstValueFrom(ref.afterClosed());
        if (!choice || choice === 'cancel') return null;

        selection.clear();

        if (choice === 'keep-actives') {
            const onlyActives = selected.filter(r => r.isActive);
            selection.select(...onlyActives);
            return 'disable';
        } else {
            const onlyInactives = selected.filter(r => !r.isActive);
            selection.select(...onlyInactives);
            return 'enable';
        }
    }
}