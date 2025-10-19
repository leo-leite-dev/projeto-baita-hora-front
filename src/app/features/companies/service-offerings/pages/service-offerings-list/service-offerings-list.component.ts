import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableGenericModule } from '../../../../../../shareds/common/MatTableGenericModule';
import { BulkSelectDirective } from '../../../../../shared/directives/bulk-select.directive';
import { BulkToolbarComponent } from '../../../../../shared/components/bulk-toolbar/ui/bulk-toolbar.component';
import { LinkButtonComponent } from '../../../../../shared/components/buttons/link-button/link-button.component';
import { BaseListComponent } from '../../../../../shared/components/table/base-list.component';
import { EntityFacade } from '../../../../../shared/components/table/contracts/entity-facade';
import { EntityDeleteService } from '../../../../../shared/components/table/contracts/entity-delete-service';
import { BULK_MESSAGES } from '../../../../../shared/components/bulk-toolbar/tokens/bulk-messages.token';
import { BulkMessages } from '../../../../../shared/components/bulk-toolbar/models/bulk-messages';
import { ServiceOffering } from '../../models/service-offering.model';
import { ServiceOfferingsFacade } from '../../data/service-offerings.facade';
import { ServiceOfferingsService } from '../../services/service-offerings.service';

@Component({
  selector: 'app-service-offerings-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableGenericModule,
    BulkSelectDirective,
    BulkToolbarComponent,
    LinkButtonComponent,
  ],
  templateUrl: './service-offerings-list.component.html',
  styleUrls: ['./service-offerings-list.component.scss'],
  providers: [
    {
      provide: BULK_MESSAGES,
      useValue: <BulkMessages>{
        activated: 'Serviços ativados.',
        deactivated: 'Serviços desativados.',
        deleteSuccess: 'Serviço excluído com sucesso.',
        deleteFail: 'Falha ao excluir. Tente novamente.',
        lockEnableMsg: 'Ação "Desativar" está bloqueada para a seleção atual.',
        lockDisableMsg: 'Ação "Ativar" está bloqueada para a seleção atual.',
      },
    },
  ],
})
export class ServiceOfferingListComponent
  extends BaseListComponent<ServiceOffering> implements OnInit {
  override baseColumns: string[] = ['name', 'price', 'currency', 'isActive', 'createdAtUtc', 'updatedAtUtc', 'actions'];

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected override facade: EntityFacade<ServiceOffering> = inject(ServiceOfferingsFacade);
  protected override deleter: EntityDeleteService<ServiceOffering> = inject(ServiceOfferingsService);

  ngOnInit(): void {
    this.initialize();
  }

  private initialize(): void {
    this.init(this.baseColumns, this.filterPredicate);
  }

  private filterPredicate = (data: ServiceOffering, filter: string): boolean => {
    const term = (filter ?? '').toLowerCase().trim();
    if (!term) 
      return true;

    const name = (data.name ?? '').toLowerCase();

    return (name.includes(term));
  };

  edit(row: ServiceOffering) {
    this.router.navigate(['../', row.id, 'edit'], { relativeTo: this.route });
  }

  create() {
    this.router.navigate(['../create'], { relativeTo: this.route });
  }

  trackById = (_: number, item: ServiceOffering) => item.id;
}