import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { InputTextComponent } from '../../../shared/components/forms/input-text/input-text.component';
import { FieldErrorsComponent } from '../../../shared/components/field-errors/field-errors.component';
import { GenericModule } from '../../../../shareds/common/GenericModule';
import { FaIconComponent } from '../../../shared/components/icons/fa-icon.component';
import { AuthResponse } from '../../../core/auth/models/auth-response.model';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [
    GenericModule,
    InputTextComponent,
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
  private router = inject(Router);

  form = this.fb.group({
    identify: ['', Validators.required],
    password: ['', Validators.required]
  });

  errorMessage: string | null = null;

  onSubmit() {
    if (this.form.invalid) return;

    this.authService.login({
      identify: this.form.value.identify!,
      password: this.form.value.password!
    }).subscribe({
      next: (resp) => {
        if (resp.companies.length > 1) {
          this.companiesDetected.emit(resp);
        } else {
          const companyId = resp.companies[0].companyId;
          this.router.navigate(['/dashboard', companyId]);
          this.close.emit();
        }
      },
      error: err => {
        this.errorMessage = err?.message ?? 'Falha ao autenticar';
      }
    });
  }

  navigateToRegister(event: Event) {
    event.preventDefault();
    this.close.emit();
  }
}
