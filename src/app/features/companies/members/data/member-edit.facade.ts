import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { MemberAdminEditView } from '../models/member-edit.model';

@Injectable({ providedIn: 'root' })
export class MemberEditFacade {
    private router = inject(Router);

    readonly memberStrict$ = this.router.events.pipe(
        startWith(null),
        map(() => this.router.routerState.root),
        map((root) => {
            let route = root;
            while (route.firstChild) route = route.firstChild;
            return route.snapshot.data['member'] as MemberAdminEditView | null;
        }),
        filter((m): m is MemberAdminEditView => !!m),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    readonly headerTitle$ = this.memberStrict$.pipe(
        map((m) => `Funcionário ${m.name}`),
        shareReplay({ bufferSize: 1, refCount: true })
    );
}