import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { MatTableGenericModule } from "../../../../../../shareds/common/MatTableGenericModule";
import { BulkSelectDirective } from "../../../../../shared/directives/bulk-select.directive";
import { BulkToolbarComponent } from "../../../../../shared/components/bulk-toolbar/ui/bulk-toolbar.component";
import { LinkButtonComponent } from "../../../../../shared/components/buttons/link-button/link-button.component";
import { BULK_MESSAGES } from "../../../../../shared/components/bulk-toolbar/tokens/bulk-messages.token";
import { BulkMessages } from "../../../../../shared/components/bulk-toolbar/models/bulk-messages";
import { BaseListComponent } from "../../../../../shared/components/table/base-list.component";
import { Position } from "../../models/position.model";
import { ActivatedRoute, Router } from "@angular/router";
import { PositionsFacade } from "../../data/position.facade";
import { PositionsService } from "../../services/positions.service";
import { EntityFacade } from "../../../../../shared/components/table/contracts/entity-facade";
import { EntityDeleteService } from "../../../../../shared/components/table/contracts/entity-delete-service";
import { ServiceOfferingOption } from "../../../service-offerings/models/service-oferring-option.model";

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableGenericModule,
    BulkSelectDirective,
    BulkToolbarComponent,
    LinkButtonComponent,
  ],
  templateUrl: './position-list.component.html',
  styleUrls: ['./position-list.component.scss'],
  providers: [
    {
      provide: BULK_MESSAGES,
      useValue: <BulkMessages>{
        activated: 'Cargos ativados.',
        deactivated: 'Cargos desativados.',
        deleteSuccess: 'Cargo excluído com sucesso.',
        deleteFail: 'Falha ao excluir. Tente novamente.',
        lockEnableMsg: 'Ação "Desativar" está bloqueada para a seleção atual.',
        lockDisableMsg: 'Ação "Ativar" está bloqueada para a seleção atual.',
      },
    },
  ],
})
export class PositionListComponent extends BaseListComponent<Position> implements OnInit {
  override baseColumns: string[] = ['name', 'serviceOfferings', 'isActive', 'createdAtUtc', 'updatedAtUtc', 'actions'];

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected override facade: EntityFacade<Position> = inject(PositionsFacade);
  protected override deleter: EntityDeleteService<Position> = inject(PositionsService);

  ngOnInit(): void {
    this.init(
      this.baseColumns,
      (d, f) => (d.name ?? '').toLowerCase().includes((f ?? '').toLowerCase())
    );
  }

  chipClassForService(_: ServiceOfferingOption, index: number): string {
    const colorIndex = (index % 5) + 1;
    return `chip chip-color-${colorIndex}`;
  }

  moreServicesTooltip(row: Position, n = 3): string {
    return (row.serviceOfferings ?? []).slice(n).map(s => s.name).join(', ');
  }

  moreCount(row: Position, n = 3): number {
    return Math.max(0, (row.serviceOfferings?.length ?? 0) - n);
  }

  firstServices(row: Position, n = 3): ServiceOfferingOption[] {
    return row.serviceOfferings?.slice(0, n) ?? [];
  }

  isFounder(row: Position): boolean {
    return (row.name ?? '').trim().toLowerCase() === 'fundador';
  }

  edit(row: Position) {
    this.router.navigate(['../', row.id, 'edit'], { relativeTo: this.route });
  }

  create() {
    this.router.navigate(['../create'], { relativeTo: this.route });
  }

  trackById = (_: number, item: Position) => item.id;
  trackByServiceId = (_: number, item: ServiceOfferingOption) => item.id;
}