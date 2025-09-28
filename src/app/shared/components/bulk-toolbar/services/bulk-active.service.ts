import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription } from 'rxjs';
import { HasIdActive } from '../models/bulk-selection.models';

export interface BulkOptions {
    undo?: boolean;
    successMsg?: string;
    errorMsg?: string;
}

@Injectable({ providedIn: 'root' })
export class BulkActiveService {
    constructor(private snack: MatSnackBar) { }

    private snapshot<T>(rows: T[]): T[] { return rows.map(r => ({ ...r })); }

    private patchActive<T extends HasIdActive>(
        rows: readonly T[], ids: ReadonlyArray<T['id']>, isActive: boolean
    ): T[] {
        const idSet = new Set(ids);
        return rows.map(r => idSet.has(r.id) ? { ...r, isActive } : r);
    }

    bulkUpdate<T extends HasIdActive>(
        getData: () => T[],
        setData: (rows: T[]) => void,
        ids: T['id'][],
        targetActive: boolean,
        requestFn: (ids: T['id'][]) => Observable<void>,
        {
            undo = true,
            successMsg,
            errorMsg,
            validateEligible = false,
        }: BulkOptions & { validateEligible?: boolean } = {}
    ): Subscription | undefined {
        if (!ids?.length)
            return;

        const data = getData();
        let effectiveIds = ids;

        if (validateEligible) {
            const byId = new Map(data.map(d => [d.id, d]));
            effectiveIds = ids.filter(id => {
                const it = byId.get(id);
                return it ? it.isActive !== targetActive : false;
            });
            if (effectiveIds.length === 0) {
                this.snack.open(
                    targetActive ? 'Nenhum item para ativar.' : 'Nenhum item para desativar.',
                    undefined, { duration: 3000 }
                );
                return;
            }
        }

        const snap = this.snapshot(data);
        setData(this.patchActive(getData(), effectiveIds, targetActive));

        return requestFn(effectiveIds).subscribe({
            next: () => {
                const msg = successMsg ?? (targetActive ? 'Itens ativados.' : 'Itens desativados.');
                if (undo) {
                    const ref = this.snack.open(msg, 'Desfazer', { duration: 5000 });
                    ref.onAction().subscribe(() => setData(snap));
                } else {
                    this.snack.open(msg, undefined, { duration: 3000 });
                }
            },
            error: () => {
                setData(snap);
                this.snack.open(errorMsg ?? 'Falha na operação. Estado restaurado.', 'Ok', { duration: 4000 });
            }
        });
    }

    toggleOne<T extends HasIdActive>(
        getData: () => T[],
        setData: (rows: T[]) => void,
        id: T['id'],
        requestFnActivate: (ids: T['id'][]) => Observable<void>,
        requestFnDisable: (ids: T['id'][]) => Observable<void>,
        undo = true
    ): Subscription | undefined {
        const item = getData().find(r => r.id === id);

        if (!item)
            return;

        const targetActive = !item.isActive;
        const fn = targetActive ? requestFnActivate : requestFnDisable;
        return this.bulkUpdate(getData, setData, [id], targetActive, fn, { undo, validateEligible: false });
    }
}