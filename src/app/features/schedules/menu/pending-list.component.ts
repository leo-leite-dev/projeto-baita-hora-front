import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pending-list',
  imports: [CommonModule],
  templateUrl: './pending-list.component.html',
  styleUrl: './pending-list.component.scss',
})
export class PendingListComponent {
  @Input() items: any[] = [];

  @Output() choose = new EventEmitter<any>();

  onClick(item: any) {
    this.choose.emit(item);
  }
}
