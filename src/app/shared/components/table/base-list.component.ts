import { AfterViewInit, Directive, ViewChild, inject, Injector } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { filter, finalize, switchMap } from 'rxjs';
import { BulkSelectDirective } from '../../directives/bulk-select.directive';
import { TableSelectionService } from '../../services/table-selection.service';
import { MixedSelectionService } from '../../services/mixed-selection.service';
import { TableFilterService } from '../../services/table-filter.service';
import { bindMixedRefiner } from '../../utils/bind-mixed-refiner.util';
import { HasIdActiveName } from '../bulk-toolbar/models/bulk-selection.models';
import { BULK_MESSAGES } from '../bulk-toolbar/tokens/bulk-messages.token';
import { BulkMessages } from '../bulk-toolbar/models/bulk-messages';
import { BulkActiveService } from '../bulk-toolbar/services/bulk-active.service';
import { EntityFacade } from './contracts/entity-facade';
import { EntityDeleteService } from './contracts/entity-delete-service';
import { DeleteConfirmDialogComponent } from '../modal/delete-confirm-dialog/delete-confirm-dialog.component';

@Directive()
export abstract class BaseListComponent<T extends HasIdActiveName> implements AfterViewInit {
  baseColumns: string[] = [];
  bulkMode = false;
  isBusy = false;
  dataSource = new MatTableDataSource<T>([]);
  filterValue = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(BulkSelectDirective) bulkSel!: BulkSelectDirective<T>;

  protected abstract facade: EntityFacade<T>;
  protected abstract deleter: EntityDeleteService<T>;

  protected readonly messages = inject<Readonly<BulkMessages>>(BULK_MESSAGES);
  protected readonly injector = inject(Injector);
  protected readonly tableSelect = inject<TableSelectionService<T>>(TableSelectionService);
  protected readonly refiner = inject(MixedSelectionService);
  protected readonly dialog = inject(MatDialog);
  protected readonly toastr = inject(ToastrService);
  protected readonly tableFilter = inject(TableFilterService);
  protected readonly bulk = inject(BulkActiveService);

  ngAfterViewInit() {
    this.tableSelect.bindSelection(this.bulkSel.selection);
    this.dataSource.sort = this.sort;

    bindMixedRefiner(this.injector, {
      isMixed: () => this.tableSelect.isMixed(),
      isRefining: () => this.tableSelect.isRefining(),
      ensureRefinedIfMixed: () => this.openRefineSelection(),
    });
  }

  protected selectedIds(): T['id'][] {
    return this.bulkSel.selectedIds(x => x.id);
  }

  init(columns: string[], filterPredicate: (d: T, f: string) => boolean) {
    this.baseColumns = columns;
    this.dataSource.filterPredicate = filterPredicate;
    this.tableSelect.baseColumns.set(columns);
    this.tableSelect.bulkMode.set(this.bulkMode);
    this.load();
  }

  load() {
    this.facade.listAll().subscribe({
      next: data => (this.dataSource.data = data),
      error: () => console.error('Erro ao carregar registros'),
    });
  }

  applyFilter(ev: Event) {
    this.tableFilter.applyFilter(ev, this.dataSource, v => (this.filterValue = v));
  }

  clearFilter() {
    this.tableFilter.clearFilter(this.dataSource, v => (this.filterValue = v));
  }

  async openRefineSelection() {
    await this.tableSelect.ensureRefinedIfMixed({
      refineIfMixed: this.refiner.refineIfMixed,
      dialog: this.dialog,
      data: this.dataSource.data,
      notify: (m) => this.toastr.info(m),
    });
  }

  onBulkModeChange(isBulk: boolean) {
    this.bulkMode = isBulk;
    this.tableSelect.bulkMode.set(isBulk);
  }

  recreateSelectionModel() {
    this.bulkSel.selection = new SelectionModel<T>(true, []);
    this.tableSelect.bindSelection(this.bulkSel.selection);
  }

  bulkActivate() {
    const lock = this.tableSelect.actionLock();
    if (lock === 'disable') {
      this.toastr.warning(this.messages.lockDisableMsg);
      return;
    }
    const ids = this.selectedIds();
    this.tableSelectBulkUpdate(ids, true, this.messages.activated);
    this.onBulkCancel();
  }

  bulkDisable() {
    const lock = this.tableSelect.actionLock();
    if (lock === 'enable') {
      this.toastr.warning(this.messages.lockEnableMsg);
      return;
    }
    const ids = this.selectedIds();
    this.tableSelectBulkUpdate(ids, false, this.messages.deactivated);
    this.onBulkCancel();
  }

  protected tableSelectBulkUpdate(ids: T['id'][], active: boolean, successMsg: string) {
    const updateFn = active
      ? this.facade.activateMany.bind(this.facade)
      : this.facade.disableMany.bind(this.facade);

    this.bulk.bulkUpdate(
      () => this.dataSource.data,
      rows => (this.dataSource.data = rows),
      ids,
      active,
      (x: T['id'][]) => updateFn(x),
      { successMsg, validateEligible: false },
    );
  }

  toggleActive(row: T) {
    if (!this.tableSelect.bulkMode()) {
      this.toastr.info('Para alterar status, use "Selecionar itens".');
      return;
    }

    this.bulk.toggleOne(
      () => this.dataSource.data,
      rows => (this.dataSource.data = rows),
      row.id,
      this.facade.activateMany,
      this.facade.disableMany,
    );
  }

  onBulkCancel() {
    this.bulkSel.exit();
  }

  remove(row: T) {
    const ref = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { id: row.id, name: row.name },
      disableClose: true,
      width: '420px',
    });

    ref.afterClosed()
      .pipe(
        filter((confirmed: boolean) => confirmed === true),
        switchMap(() => {
          this.isBusy = true;
          return this.deleter.delete(row.id).pipe(finalize(() => (this.isBusy = false)));
        }),
      )
      .subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter((x) => x.id !== row.id);
          this.toastr.success(this.messages.deleteSuccess);
        },
        error: (err: unknown) => {
          console.error('Falha ao excluir', err);
          this.toastr.error(this.messages.deleteFail, 'Erro');
        },
      });
  }
}