import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { shareReplay, finalize, take } from 'rxjs';
import { BULK_MESSAGES } from '../../../../../shared/components/bulk-toolbar/tokens/bulk-messages.token';
import { BulkMessages } from '../../../../../shared/components/bulk-toolbar/models/bulk-messages';
import { BaseListComponent } from '../../../../../shared/components/table/base-list.component';
import { EntityFacade } from '../../../../../shared/components/table/contracts/entity-facade';
import { EntityDeleteService } from '../../../../../shared/components/table/contracts/entity-delete-service';
import { Member } from '../../models/member.model';
import { MemberFacade } from '../../data/member.facade';
import { MembersService } from '../../services/member.service';
import { PositionsService } from '../../../positions/services/positions.service';
import { ChangeMemberPositionRequest } from '../../contracts/change-member-position-request';
import { MatTableGenericModule } from '../../../../../../shareds/common/MatTableGenericModule';
import { Position } from '../../../positions/models/position.model';
import { extractErrorMessage } from '../../../../../shared/utils/error.util';
import { MemberViewDialogComponent } from '../../modal/member-view-dialog.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableGenericModule,
    MatMenuModule
  ],
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
  providers: [
    {
      provide: BULK_MESSAGES,
      useValue: <BulkMessages>{
        activated: 'Membros ativados.',
        deactivated: 'Membros desativados.',
        deleteSuccess: 'Membro excluído com sucesso.',
        deleteFail: 'Falha ao excluir. Tente novamente.',
        lockEnableMsg: 'Ação "Desativar" está bloqueada para a seleção atual.',
        lockDisableMsg: 'Ação "Ativar" está bloqueada para a seleção atual.',
      },
    },
  ],
})
export class MemberListComponent extends BaseListComponent<Member> implements OnInit {
  override baseColumns: string[] = ['name', 'role', 'email', 'phone', 'isActive', 'joinedAt', 'createdAtUtc', 'updatedAtUtc', 'actions'];

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly positionsService = inject(PositionsService);
  private readonly membersService = inject(MembersService);

  protected override facade: EntityFacade<Member> = inject(MemberFacade);
  protected override deleter: EntityDeleteService<Member> = inject(MembersService);

  positionOptions$ = this.positionsService.listAll()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  ngOnInit(): void {
    this.init(this.baseColumns, this.filterPredicate);
  }

  private filterPredicate(data: Member, filter: string): boolean {
    const term = (filter ?? '').toLowerCase();
    return (
      (data.name ?? '').toLowerCase().includes(term) ||
      (data.role ?? '').toLowerCase().includes(term)
    );
  }

  isOwner(row: Member): boolean {
    return (row.role ?? '').trim().toLowerCase() === 'owner';
  }

  private canPromoteTo(row: Member, opt: Position): boolean {
    if (!row?.id)
      return false;

    if (row.isActive === false)
      return false;

    const name = (opt.name ?? '').trim().toLowerCase();
    if (name === 'fundador') return false;

    const currentId =
      String((row as any).positionId ?? (row as any).primaryPositionId ?? '');

    if (currentId && currentId === String(opt.id))
      return false;

    const currentRole = (row.role ?? '').trim().toLowerCase();
    const optAccess = String(opt.accessLevel ?? '').trim().toLowerCase();
    if (!!currentRole && !!optAccess && currentRole === optAccess)
      return false;

    return true;
  }

  hasPromoteOptions(row: Member, list: Position[] | null | undefined): boolean {
    const items = list ?? [];
    return items.some(opt => this.canPromoteTo(row, opt));
  }

  getPromoteOptions(row: Member, list: Position[] | null | undefined): Position[] {
    const items = list ?? [];
    return items.filter(opt => this.canPromoteTo(row, opt));
  }

  promote(row: Member, positionId: string | number): void {
    if (!row?.id) return;

    const payload: ChangeMemberPositionRequest = {
      positionId: String(positionId),
      alignRoleToPosition: true,
    };

    this.isBusy = true;
    this.membersService.promote(row.id, payload)
      .pipe(
        take(1),
        finalize(() => (this.isBusy = false))
      )
      .subscribe({
        next: (res) => {
          (row as any).positionId = String(res.newPositionId);
          row.role = res.accessLevel;
          this.refreshDataSource();
          this.toastr.success('Membro promovido com sucesso!');
        },
        error: (err) => {
          const status: number | undefined = err?.status;
          const msg = extractErrorMessage(err);
          if (status === 409) {
            this.toastr.warning(msg || 'Conflito ao promover.', 'Atenção', {
              toastClass: 'ngx-toastr custom-toast toast-warning',
            });
            return;
          }
          this.toastr.error(msg || 'Falha ao promover o membro.', 'Erro');
          console.error('Falha ao promover', err);
        },
      });
  }

  create(): void {
    this.router.navigate(['../create'], { relativeTo: this.route });
  }

  edit(row: Member) {
    this.router.navigate(['../', row.id, 'edit'], { relativeTo: this.route });
  }

  openView(row: { id: string }) {
    console.log('[MemberList] openView -> row.id =', row?.id);
    this.dialog.open(MemberViewDialogComponent, {
      width: '720px',
      data: { memberId: row.id },
    });
  }

  private refreshDataSource(): void {
    if ((this as any).dataSource?.data) {
      (this as any).dataSource.data = [...(this as any).dataSource.data];
    }
  }

  trackById = (_: number, item: Member) => item.id;
}