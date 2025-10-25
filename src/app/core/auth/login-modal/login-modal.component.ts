import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../models/auth-response.model';
import { GenericModule } from '../../../../shareds/common/GenericModule';
import { InputComponent } from '../../../shared/components/inputs/input/input.component';
import { FaIconComponent } from '../../../shared/components/icons/fa-icon.component';
import { FieldErrorsComponent } from '../../../shared/components/field-errors/field-errors.component';
import { extractErrorMessage } from '../../../shared/utils/error.util';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [
    GenericModule,
    InputComponent,
    FaIconComponent,
    FieldErrorsComponent
  ],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() companiesDetected = new EventEmitter<AuthResponse>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private session = inject(SessionService);
  private router = inject(Router);

  form = this.fb.group({
    identify: ['', Validators.required],
    password: ['', Validators.required]
  });

  errorMessage: string | null = null;

  onSubmit() {
    if (this.form.invalid)
      return;

    this.form.disable();
    this.errorMessage = null;

    const payload = {
      identify: this.form.value.identify!,
      password: this.form.value.password!
    };

    this.authService.login(payload)
      .pipe(finalize(() => this.form.enable()))
      .subscribe({
        next: (resp) => {
          const companies = resp?.companies ?? [];
          if (companies.length > 1) {
            this.companiesDetected.emit(resp);
            return;
          }

          const companyId = companies[0]?.companyId;
          if (!companyId) {
            this.errorMessage = 'Empresa não identificada após login.';
            return;
          }

          this.authService.setActiveCompany(companyId);
          this.session.markAuthenticated(companyId);
          this.router.navigate(['/app/dashboard', companyId]);
          this.close.emit();
        },
        error: (err) => {
          const msg = extractErrorMessage(err);
          if (err?.fieldErrors) {
            Object.entries(err.fieldErrors).forEach(([key, message]) => {
              this.form.get(key)?.setErrors({ server: message });
            });
          }
          this.form.setErrors({ server: msg });
          this.errorMessage = msg;
        },
      });
  }

  navigateToRegister(event: Event) {
    event.preventDefault();
    this.close.emit();
  }
}