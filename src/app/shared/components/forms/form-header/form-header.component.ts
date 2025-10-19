import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-header.component.html',
  styleUrl: './form-header.component.scss'
})
export class FormHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
