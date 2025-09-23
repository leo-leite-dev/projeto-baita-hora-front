import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigateButtonComponent } from '../shared/components/buttons/navigate-button/navigate-button.component';
import { LoginModalComponent } from '../fetures/auth/login-modal/login-modal.component';
import { AuthService } from '../core/auth/services/auth.service';
import { AuthResponse } from '../core/auth/models/auth-response.model';
import { CompaniesModalComponent } from '../fetures/auth/companies-modal/companies-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports:
    [
      CommonModule,
      NavigateButtonComponent,
      LoginModalComponent,
      CompaniesModalComponent
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
      // salvar auth no state/global store
      console.log('Empresa selecionada', resp);
      this.showCompanies = false;
    });
  }

  goToCreateUserCompany() {
    this.router.navigate(['/onboarding/create-owner']);
  }
}