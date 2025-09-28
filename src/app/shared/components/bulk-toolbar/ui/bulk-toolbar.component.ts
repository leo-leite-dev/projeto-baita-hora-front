import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-bulk-toolbar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './bulk-toolbar.component.html',
  styleUrls: ['./bulk-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkToolbarComponent {
  @Input() selectionCount = 0;
  @Input() active = false;
  @Input() busy = false;
  @Input() hideActivateAction = false;
  @Input() hideDisableAction = false;

  @Input() enterLabel = 'Selecionar itens';
  @Input() activateLabel = 'Ativar selecionados';
  @Input() disableLabel = 'Desativar selecionados';
  @Input() cancelLabel = 'Cancelar';

  @Input() disableActivateAction = false;
  @Input() disableDisableAction = false;

  @Output() enter = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() activate = new EventEmitter<void>();
  @Output() disable = new EventEmitter<void>();
}