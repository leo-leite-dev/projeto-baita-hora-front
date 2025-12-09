import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environments";
import { ErrorHandlingService } from "../../../shared/services/error-handling.service";
import { UserDetails } from "../models/user-details.profile";
import { PatchUserRequest } from "../../../shared/contracts/user-request";
import { ChangePasswordRequest } from "../../../shared/contracts/password-request";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private readonly api = `${environment.apiBaseUrl}/users`;

  private http = inject(HttpClient);
  private errors = inject(ErrorHandlingService);

  getMyUser(): Observable<UserDetails> {
    return this.http
      .get<UserDetails>(`${this.api}/me`)
      .pipe(this.errors.rxThrow<UserDetails>("UserService.getMyUser"));
  }

  patchMyUser(payload: PatchUserRequest): Observable<void> {
    return this.http
      .patch<void>(`${this.api}/me`, payload)
      .pipe(this.errors.rxThrow<void>("UserService.patchMyUser"));
  }

  patchUser(targetUserId: string, payload: PatchUserRequest): Observable<void> {
    return this.http
      .patch<void>(`${this.api}/${targetUserId}`, payload)
      .pipe(this.errors.rxThrow<void>("UserService.patchUser"));
  }

  changeMyPassword(payload: ChangePasswordRequest): Observable<void> {
    return this.http
      .patch<void>(`${this.api}/me/password`, payload)
      .pipe(this.errors.rxThrow<void>("UserService.changeMyPassword"));
  }
}