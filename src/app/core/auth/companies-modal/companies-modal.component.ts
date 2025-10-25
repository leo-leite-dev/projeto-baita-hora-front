import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthCompanyResponse } from '../models/auth-response.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-companies-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companies-modal.component.html',
  styleUrls: ['./companies-modal.component.scss']
})
export class CompaniesModalComponent {
  @Input() companies: AuthCompanyResponse[] = [];
  @Output() select = new EventEmitter<string>();

  onSelect(companyId: string) {
    this.select.emit(companyId);
  }
}