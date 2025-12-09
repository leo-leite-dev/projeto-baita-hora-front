import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../models/auth-response.model';
import { GenericModule } from '../../../../shareds/common/GenericModule';
import { InputComponent } from '../../../shared/components/inputs/input/input.component';
import { FaIconComponent } from '../../../shared/components/icons/fa-icon.component';
import { FieldErrorsComponent } from '../../../shared/components/field-errors/field-errors.component';
import { extractErrorMessage } from '../../../shared/utils/error.util';
import { SessionService } from '../services/session.service';
import { PreLoginResponse } from '../models/pre-login-response.model';

type Step = 'credentials' | 'choose-company';

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
  @Output() loggedIn = new EventEmitter<AuthResponse>();

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private session = inject(SessionService);
  private router = inject(Router);

  form = this.fb.group({
    identify: ['', Validators.required],
    password: ['', Validators.required],
  });

  step: Step = 'credentials';
  pendingCompanies: Array<{ companyId: string; name: string }> = [];

  errorMessage: string | null = null;
  loading = false;

  onSubmit() {
    if (this.form.invalid || this.loading)
      return;

    this.errorMessage = null;
    this.loading = true;
    this.form.disable();

    const payload = {
      identify: this.form.value.identify!,
      password: this.form.value.password!,
    };

    this.auth.prelogin(payload).pipe(
      catchError(err => {
        this.errorMessage = extractErrorMessage(err) ?? 'Falha ao autenticar.';
        return of<PreLoginResponse | null>(null);
      }),
      finalize(() => {
        this.loading = false;
        this.form.enable();
      })
    ).subscribe(resp => {
      if (!resp)
        return;

      const companies = resp.companies ?? [];

      if (companies.length === 0) {
        this.errorMessage = 'Nenhuma empresa vinculada à sua conta.';
        return;
      }

      if (companies.length === 1) {
        this.selectCompany(companies[0].companyId);
        return;
      }

      this.pendingCompanies = companies.map(c => ({
        companyId: c.companyId,
        name: c.name,
      }));

      this.step = 'choose-company';
    });
  }

selectCompany(companyId: string) {
  this.errorMessage = null;
  this.loading = true;

  // 👉 Define a empresa ativa ANTES de chamar a API
  this.auth.setActiveCompany(companyId);

  const payload = {
    identify: this.form.value.identify!,
    password: this.form.value.password!,
    // opcional: se o back aceitar, pode manter
    companyId,
  };

  this.auth.login(payload).pipe(
    catchError(err => {
      this.errorMessage = extractErrorMessage(err) ?? 'Falha ao selecionar empresa.';
      return of<AuthResponse | null>(null);
    }),
    finalize(() => { this.loading = false; })
  ).subscribe(resp => {
    if (!resp?.accessToken) {
      this.errorMessage = 'Não foi possível concluir o login.';
      return;
    }

    // Se tu quiser manter controle local também:
    // this.auth.setActiveCompany(companyId);

    this.session.markAuthenticated(companyId);
    this.loggedIn.emit(resp);

    this.router.navigate(['/app/dashboard', companyId]);
    this.close.emit();
  });
}


  backToCredentials() {
    if (this.loading)
      return;

    this.step = 'credentials';
    this.errorMessage = '';
  }

  navigateToRegister(event: Event) {
    event.preventDefault();
    this.close.emit();
  }
}