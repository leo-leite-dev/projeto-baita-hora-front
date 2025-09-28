import { Component, OnInit, AfterViewInit, ViewChild, inject, effect, Injector, computed, untracked } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatTableGenericModule } from '../../../../../../shareds/common/MatTableGenericModule';
import { BulkSelectDirective } from '../../../../../shared/directives/bulk-select.directive';
import { BulkToolbarComponent } from '../../../../../shared/components/bulk-toolbar/ui/bulk-toolbar.component';
import { LinkButtonComponent } from '../../../../../shared/components/buttons/link-button/link-button.component';
import { Position, ServiceDto } from '../../models/position.model';
import { PositionsFacade } from '../../data/position.facade';
import { BulkActiveService } from '../../../../../shared/components/bulk-toolbar/services/bulk-active.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, finalize, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmDialogComponent } from '../../../../../shared/components/modal/delete-confirm-dialog/delete-confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { PositionsService } from '../../services/positions.service';
import { MixedSelectionService } from '../../../../../shared/services/mixed-selection.service';
import { TableSelectionService } from '../../../../../shared/services/table-selection.service';
import { SelectionModel } from '@angular/cdk/collections';
import { TableFilterService } from '../../../../../shared/services/table-filter.service';

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableGenericModule,
    BulkSelectDirective,
    BulkToolbarComponent,
    LinkButtonComponent
  ],
  templateUrl: './position-list.component.html',
  styleUrls: ['./position-list.component.scss'],
})
export class PositionListComponent implements OnInit, AfterViewInit {
  baseColumns: string[] = ['name', 'serviceOfferings', 'isActive', 'createdAtUtc', 'actions'];
  bulkMode = false;
  isBusy = false;
  dataSource = new MatTableDataSource<Position>([]);
  filterValue = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(BulkSelectDirective) bulkSel!: BulkSelectDirective<Position>;
  readonly shouldRefine = computed(() => this.tableSelect.isMixed());

  private service = inject(PositionsService);
  private facade = inject(PositionsFacade);
  private bulk = inject(BulkActiveService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private refiner = inject(MixedSelectionService);
  public tableSelect = inject<TableSelectionService<Position>>(TableSelectionService);
  private injector = inject(Injector);
  private tableFilter = inject(TableFilterService);

  private get selectedIds(): Array<Position['id']> {
    return this.bulkSel.selectedIds(x => x.id);
  }

  ngOnInit() {
    this.load();
    this.dataSource.filterPredicate = (d, f) => (d.name ?? '').toLowerCase().includes(f);

    this.tableSelect.baseColumns.set(this.baseColumns);
    this.tableSelect.bulkMode.set(this.bulkMode);
  }

  ngAfterViewInit() {
    this.tableSelect.bindSelection(this.bulkSel.selection);
    this.dataSource.sort = this.sort;

    effect(() => {
      const mixed = this.shouldRefine();
      const refining = untracked(() => this.tableSelect.isRefining());
      if (mixed && !refining) {
        queueMicrotask(() => {
          if (this.tableSelect.isMixed() && !this.tableSelect.isRefining()) {
            void this.tableSelect.ensureRefinedIfMixed({
              refineIfMixed: this.refiner.refineIfMixed,
              dialog: this.dialog,
              data: this.dataSource.data,
              notify: (m) => this.toastr.info(m),
            });
          }
        });
      }
    }, { injector: this.injector });
  }

  recreateSelectionModel() {
    this.bulkSel.selection = new SelectionModel<Position>(true, []);
    this.tableSelect.bindSelection(this.bulkSel.selection);
  }

  onBulkModeChange(isBulk: boolean) {
    this.bulkMode = isBulk;
    this.tableSelect.bulkMode.set(isBulk);
  }

  chipClassForService(s: ServiceDto, index: number): string {
    const colorIndex = (index % 5) + 1;
    return `chip chip-color-${colorIndex}`;
  }

  load() {
    this.facade.listAll().subscribe({
      next: data => {
        this.dataSource.data = data;
      },
      error: () => console.error('Erro ao carregar positions')
    });
  }

  applyFilter(ev: Event) {
    this.tableFilter.applyFilter(ev, this.dataSource, v => this.filterValue = v);
  }

  clearFilter() {
    this.tableFilter.clearFilter(this.dataSource, v => this.filterValue = v);
  }

  async openRefineSelection() {
    await this.tableSelect.ensureRefinedIfMixed({
      refineIfMixed: this.refiner.refineIfMixed,
      dialog: this.dialog,
      data: this.dataSource.data,
      notify: (m) => this.toastr.info(m),
    });
  }

  onBulkCancel() {
    this.bulkSel.exit();
  }

  bulkActivate() {
    const lock = this.tableSelect.actionLock();
    if (lock === 'disable') {
      this.toastr.warning('Ação "Ativar" está bloqueada para a seleção atual.');
      return;
    }

    const ids = this.selectedIds;

    this.bulk.bulkUpdate(
      () => this.dataSource.data,
      rows => (this.dataSource.data = rows),
      ids,
      true,
      (x) => this.facade.activateMany(x),
      { successMsg: 'Cargos ativados.', validateEligible: false }
    );

    this.onBulkCancel();
  }

  bulkDisable() {
    const lock = this.tableSelect.actionLock();
    if (lock === 'enable') {
      this.toastr.warning('Ação "Desativar" está bloqueada para a seleção atual.');
      return;
    }

    const ids = this.selectedIds;

    this.bulk.bulkUpdate(
      () => this.dataSource.data,
      rows => (this.dataSource.data = rows),
      ids,
      false,
      (x) => this.facade.disableMany(x),
      { successMsg: 'Cargos desativados.', validateEligible: false }
    );

    this.onBulkCancel();
  }

  toggleActive(row: Position) {
    if (!this.tableSelect.bulkMode()) {
      this.toastr.info('Para alterar status, use "Selecionar itens".');
      return;
    }

    this.bulk.toggleOne(
      () => this.dataSource.data,
      rows => (this.dataSource.data = rows),
      row.id,
      this.facade.activateMany,
      this.facade.disableMany
    );
  }

  moreServicesTooltip(row: Position, n = 3): string {
    return (row.serviceOfferings ?? [])
      .slice(n)
      .map(s => s.name)
      .join(', ');
  }

  moreCount(row: Position, n = 3): number {
    return Math.max(0, (row.serviceOfferings?.length ?? 0) - n);
  }

  firstServices(row: Position, n = 3): ServiceDto[] {
    return row.serviceOfferings?.slice(0, n) ?? [];
  }

  edit(row: Position) {
    this.router.navigate(['../', row.id, 'edit'], { relativeTo: this.route });
  }

  remove(row: Position) {
    const ref = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { id: row.id, name: row.name },
      disableClose: true,
      width: '420px'
    });

    ref.afterClosed()
      .pipe(
        filter((confirmed) => confirmed === true),
        switchMap(() => {
          this.isBusy = true;
          return this.service.delete(row.id).pipe(finalize(() => (this.isBusy = false)));
        })
      )
      .subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter((x) => x.id !== row.id);
          this.toastr.success('Cargo excluído com sucesso.');
        },
        error: (err) => {
          console.error('Falha ao excluir', err);
          this.toastr.error('Falha ao excluir. Tente novamente.', 'Erro');
        }
      });
  }

  create() {
    this.router.navigate(['../create'], { relativeTo: this.route });
  }

  trackById = (_: number, item: Position) => item.id;
  trackByServiceId = (_: number, s: ServiceDto) => s.id;
}