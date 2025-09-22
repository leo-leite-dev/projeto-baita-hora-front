import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GenericModule } from '../../../../../shareds/common/GenericModule';

@Component({
  selector: 'app-navigate-button',
  standalone: true,
  imports: [GenericModule, RouterModule],
  templateUrl: './navigate-button.component.html',
  styleUrl: './navigate-button.component.scss'
})
export class NavigateButtonComponent {
  @Input() routerLink!: string;
  @Input() type: 'primary' | 'secondary' = 'primary';

  @Output() clicked = new EventEmitter<void>();
}