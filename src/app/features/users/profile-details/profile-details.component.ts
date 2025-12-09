import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { ProfileService } from '../services/profile.service';
import { UserDetails } from '../models/user-details.profile';
import { UserProfileDetails } from '../models/user-profile-details';
import { LinkButtonComponent } from '../../../shared/components/buttons/link-button/link-button.component';
import { PageStateComponent } from '../../../shared/components/page-state/page-state.component';
import { forkJoin } from 'rxjs';
import { IntlPhonePipe } from '../../../shared/pipes/intl-phone.pipe';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [
    CommonModule,
    LinkButtonComponent,
    PageStateComponent,
    IntlPhonePipe
  ],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
})
export class ProfileDetailsComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly userService = inject(UserService);

  profile: UserProfileDetails | null = null;
  user: UserDetails | null = null;

  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadData();
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
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        this.error = 'Não foi possível carregar seu perfil.';
        this.loading = false;
      },
    });
  }
}