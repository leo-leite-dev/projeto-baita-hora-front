import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'ghost' | 'clean' | 'danger';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'ghost' | 'clean' | 'danger' = 'primary';
  @Input() htmlType: 'button' | 'submit' | 'reset' = 'button'; 
  @Input() disabled = false;
  @Input() loading = false;
  @Input() label = 'Continuar';

  @Output() clicked = new EventEmitter<MouseEvent>();

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  onClick(event: MouseEvent) {
    if (this.isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (this.htmlType !== 'submit')
      this.clicked.emit(event);
  }
}