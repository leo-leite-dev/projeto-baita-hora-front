import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../shared/components/buttons/button/button.component';
import { LinkButtonComponent } from '../shared/components/buttons/link-button/link-button.component';
import { LoginModalComponent } from '../core/auth/login-modal/login-modal.component';
import { AuthResponse } from '../core/auth/models/auth-response.model';
import { SessionService } from '../core/auth/services/session.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    LinkButtonComponent,
    LoginModalComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  showLogin = false;

  private router = inject(Router);
  private session = inject(SessionService);

  openLoginModal() {
    this.showLogin = true;
  }

  onLoggedIn(resp: AuthResponse) {
    this.showLogin = false;

    const fromList = resp.companies?.[0]?.companyId ?? '';
    let fromJwt = '';
    try {
      const payload = JSON.parse(atob(resp.accessToken.split('.')[1] || ''));
      fromJwt = payload?.companyId || '';
    } catch { }

    const companyId = fromJwt || fromList || 'placeholder';

    this.session.markAuthenticated(companyId);

    this.router.navigate(['/app', 'dashboard', companyId]);
  }
}