import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { forkJoin } from "rxjs";
import { ProfileFormComponent } from "../../../shared/components/forms/profile-form/profile-form.component";
import { UserFormComponent } from "../forms/user-form.component";
import { ButtonComponent } from "../../../shared/components/buttons/button/button.component";
import { BackButtonComponent } from "../../../shared/components/buttons/back-button/back-button.component";
import { PageStateComponent } from "../../../shared/components/page-state/page-state.component";
import { UserProfileDetails } from "../models/user-profile-details";
import { UserDetails } from "../models/user-details.profile";
import { ProfileService } from "../services/profile.service";
import { UserService } from "../services/user.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";

@Component({
  selector: "app-profile-edit",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProfileFormComponent,
    UserFormComponent,
    ButtonComponent,
    BackButtonComponent,
    PageStateComponent,
  ],
  templateUrl: "./profile-edit.component.html",
  styleUrl: "./profile-edit.component.scss",
})
export class ProfileEditComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitting = false;
  error: string | null = null;

  profile: UserProfileDetails | null = null;
  user: UserDetails | null = null;

  private initialUserFormValue: { username: string; email: string } | null = null;
  private initialProfileFormValue: any | null = null;

  private readonly profileService = inject(ProfileService);
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private router = inject(Router);

  ngOnInit(): void {
    this.buildForm();
    this.loadData();
  }

  get userGroup(): FormGroup {
    return this.form.get("user") as FormGroup;
  }

  get profileGroup(): FormGroup {
    return this.form.get("profile") as FormGroup;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      user: this.fb.group({
        username: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
      }),
      profile: this.fb.group({
        fullName: ["", Validators.required],
        cpf: ["", Validators.required],
        rg: [""],
        phone: ["", Validators.required],
        birthDate: ["", Validators.required],
        address: this.fb.group({
          zipCode: [""],
          street: [""],
          city: [""],
          neighborhood: [""],
          number: [""],
          state: [""],
          complement: [""],
        }),
      }),
    });
  }

  private mapProfileToForm(profile: UserProfileDetails) {
    return {
      fullName: profile.fullName,
      cpf: profile.cpf,
      rg: profile.rg ?? "",
      phone: profile.phone?.replace(/^\+/, "") ?? "",
      birthDate: profile.birthDate ?? "",
      address: {
        zipCode: profile.address?.zipCode ?? "",
        street: profile.address?.street ?? "",
        city: profile.address?.city ?? "",
        neighborhood: profile.address?.neighborhood ?? "",
        number: profile.address?.number ?? "",
        state: profile.address?.state ?? "",
        complement: profile.address?.complement ?? "",
      },
    };
  }

  private hasGroupChanged(initial: any, group: FormGroup): boolean {
    if (!initial)
      return false;

    if (!group.dirty)
      return false;

    const current = group.getRawValue();
    return JSON.stringify(initial) !== JSON.stringify(current);
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      user: this.userService.getMyUser(),
      profile: this.profileService.getMyProfile(),
    }).subscribe({
      next: ({ user, profile }) => {
        this.user = user;
        this.profile = profile;

        const userFormValue = {
          username: user.username,
          email: user.email,
        };

        const profileFormValue = this.mapProfileToForm(profile);

        this.initialUserFormValue = JSON.parse(JSON.stringify(userFormValue));
        this.initialProfileFormValue = JSON.parse(JSON.stringify(profileFormValue));

        this.form.patchValue({
          user: userFormValue,
          profile: profileFormValue,
        });

        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.loading = false;
      },
      error: () => {
        this.error = "Não foi possível carregar seus dados.";
        this.loading = false;
      },
    });
  }

  revert(): void {
    if (!this.initialUserFormValue || !this.initialProfileFormValue) {
      this.form.reset();
    } else {
      this.form.reset({
        user: this.initialUserFormValue,
        profile: this.initialProfileFormValue,
      });
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const userPayload = raw.user;
    const profilePayload = raw.profile;

    const userChanged = this.hasGroupChanged(this.initialUserFormValue, this.userGroup);
    const profileChanged = this.hasGroupChanged(this.initialProfileFormValue, this.profileGroup);

    if (!userChanged && !profileChanged) {
      this.toastr.info('Nenhuma alteração para salvar.');
      return;
    }

    this.submitting = true;
    this.error = null;

    const requests = [];

    if (userChanged) 
      requests.push(this.userService.patchMyUser(userPayload));

    if (profileChanged) 
      requests.push(this.profileService.patchMyProfile(profilePayload));
    
    forkJoin(requests).subscribe({
      next: () => {
        this.submitting = false;

        this.toastr.success('Perfil editado com sucesso!');
        this.router.navigate(['/app/profile/details']);
      },
      error: () => {
        this.error = 'Erro ao salvar seus dados.';
        this.submitting = false;
      },
    });
  }
}