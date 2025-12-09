import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environments";
import { ErrorHandlingService } from "../../../shared/services/error-handling.service";
import { UserProfileDetails } from "../models/user-profile-details";
import { PatchUserProfileRequest } from "../../../shared/contracts/user-profile-request";


@Injectable({ providedIn: "root" })
export class ProfileService {
    private readonly api = `${environment.apiBaseUrl}/users/profile`;

    private http = inject(HttpClient);
    private errors = inject(ErrorHandlingService);

    getMyProfile(): Observable<UserProfileDetails> {
        return this.http
            .get<UserProfileDetails>(`${this.api}/me`)
            .pipe(this.errors.rxThrow<UserProfileDetails>("ProfileService.getMyProfile"));
    }

    patchMyProfile(payload: PatchUserProfileRequest): Observable<void> {
        return this.http
            .patch<void>(`${this.api}/me`, payload)
            .pipe(this.errors.rxThrow<void>("ProfileService.patchMyProfile"));
    }
}