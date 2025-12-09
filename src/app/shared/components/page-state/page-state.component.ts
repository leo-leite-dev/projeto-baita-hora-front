import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-state.component.html',
  styleUrl: './page-state.component.scss',
})
export class PageStateComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() loadingMessage = 'Carregando...';
}
