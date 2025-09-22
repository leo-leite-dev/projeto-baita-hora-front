import { Component } from '@angular/core';
import { NavigateButtonComponent } from '../shared/components/buttons/navigate-button/navigate-button.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavigateButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private router: Router) { }

  goToCreateUserCompany() {
    this.router.navigate(['/onboarding/create-owner']);
  }
}