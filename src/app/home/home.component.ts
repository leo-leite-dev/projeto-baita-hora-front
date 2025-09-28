import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth/services/auth.service';
import { AuthResponse } from '../core/auth/models/auth-response.model';
import { Router } from '@angular/router';
import { ButtonComponent } from '../shared/components/buttons/button/button.component';
import { LoginModalComponent } from '../features/auth/login-modal/login-modal.component';
import { CompaniesModalComponent } from '../features/auth/companies-modal/companies-modal.component';
import { LinkButtonComponent } from '../shared/components/buttons/link-button/link-button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports:
    [
      CommonModule,
      LoginModalComponent,
      CompaniesModalComponent,
      ButtonComponent,
      LinkButtonComponent
    ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  showLogin = false;
  showCompanies = false;
  companies: AuthResponse['companies'] = [];

  constructor(
    private authService: AuthService,
    private router: Router) { }

  openLoginModal() {
    this.showLogin = true;
  }

  onCompaniesDetected(resp: AuthResponse) {
    this.showLogin = false;
    this.showCompanies = true;
    this.companies = resp.companies;
  }

  onCompanySelected(companyId: string) {
    this.authService.selectCompany({ companyId }).subscribe(resp => {
      console.log('Empresa selecionada', resp);
      this.showCompanies = false;
    });
  }

  goToCreateUserCompany() {
    this.router.navigate(['/onboarding/create-owner']);
  }
}