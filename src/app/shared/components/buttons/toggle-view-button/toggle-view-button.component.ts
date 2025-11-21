import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-toggle-view-button',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './toggle-view-button.component.html',
})
export class ToggleViewButtonComponent {
  @Input({ required: true }) view!: string;
  @Input({ required: true }) activeView!: string;
  @Input({ required: true }) label!: string;

  @Input() activeVariant: 'primary' | 'ghost' | 'clean' | 'danger' = 'primary';
  @Input() inactiveVariant: 'primary' | 'ghost' | 'clean' | 'danger' = 'ghost';

  @Output() changed = new EventEmitter<string>();

  onClick() {
    this.changed.emit(this.view);
  }

  get variant() {
    return this.activeView === this.view ? this.activeVariant : this.inactiveVariant;
  }
}
