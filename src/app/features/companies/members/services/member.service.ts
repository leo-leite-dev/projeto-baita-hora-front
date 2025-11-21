import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { ErrorHandlingService } from '../../../../shared/services/error-handling.service';
import { Member } from '../models/member.model';
import { MemberAdminEditView } from '../models/member-edit.model';
import { RegisterEmployeeRequest } from '../contracts/register-employee-request';
import { RegisterEmployeeResponse } from '../contracts/employee-response';
import { PatchMemberRequest } from '../contracts/patch-member-request';
import { ActivateEmployeesRequest } from '../contracts/activate-employee-request';
import { DisableEmployeesRequest } from '../contracts/disable-employees-request';
import { ChangeMemberPositionRequest } from '../contracts/change-member-position-request';
import { ChangeMemberPositionResponse } from '../contracts/change-member-position.response';
import { MemberProfileDetails } from '../models/member-profile-details';
import { MemberOption } from '../models/member-options.model';

@Injectable({ providedIn: 'root' })
export class MembersService {
    private readonly membersUrl = `${environment.apiBaseUrl}/companies/members`;
    private readonly employeesUrl = `${this.membersUrl}/employees`;
    private readonly activateUrl = `${this.membersUrl}/activate`;
    private readonly disableUrl = `${this.membersUrl}/disable`;

    private http = inject(HttpClient);
    private errors = inject(ErrorHandlingService);

    listAll(): Observable<Member[]> {
        return this.http
            .get<Member[]>(this.membersUrl)
            .pipe(this.errors.rxThrow<Member[]>('MembersService.listAll'));
    }

    getDetails(memberId: string): Observable<MemberProfileDetails> {
        return this.http
            .get<MemberProfileDetails>(`${this.membersUrl}/${memberId}/details`)
            .pipe(this.errors.rxThrow<MemberProfileDetails>('MembersService.getDetails'));
    }

    getById(memberId: string): Observable<MemberAdminEditView> {
        return this.http
            .get<MemberAdminEditView>(`${this.membersUrl}/${memberId}`)
            .pipe(this.errors.rxThrow<MemberAdminEditView>('MembersService.getById'));
    }

    create(payload: RegisterEmployeeRequest): Observable<RegisterEmployeeResponse> {
        return this.http
            .post<RegisterEmployeeResponse>(this.employeesUrl, payload)
            .pipe(this.errors.rxThrow<RegisterEmployeeResponse>('MembersService.create'));
    }

    patch(memberId: string, payload: PatchMemberRequest): Observable<void> {
        return this.http
            .patch<void>(`${this.membersUrl}/${memberId}`, payload)
            .pipe(this.errors.rxThrow<void>('MembersService.patch'));
    }

    activateMany(memberIds: string[]): Observable<void> {
        const body: ActivateEmployeesRequest = { memberIds };
        return this.http
            .patch<void>(this.activateUrl, body)
            .pipe(this.errors.rxThrow<void>('MembersService.activateMany'));
    }

    disableMany(memberIds: string[]): Observable<void> {
        const body: DisableEmployeesRequest = { memberIds };
        return this.http
            .patch<void>(this.disableUrl, body)
            .pipe(this.errors.rxThrow<void>('MembersService.disableMany'));
    }

    delete(id: string): Observable<void> {
        return this.http
            .delete<void>(`${this.membersUrl}/${id}`)
            .pipe(this.errors.rxThrow<void>("MembersService.delete"));
    }

    promote(memberId: string, payload: ChangeMemberPositionRequest): Observable<ChangeMemberPositionResponse> {
        return this.http
            .patch<ChangeMemberPositionResponse>(`${this.membersUrl}/${memberId}/position`, payload)
            .pipe(this.errors.rxThrow<ChangeMemberPositionResponse>('MembersService.promote'));
    }

    listMemberOptions(search: string = '', take: number = 20): Observable<MemberOption[]> {
        const params: Record<string, string> = {};

        if (search)
            params['search'] = search;

        if (take)
            params['take'] = String(take);

        return this.http
            .get<MemberOption[]>(`${this.membersUrl}/options`, { params })
            .pipe(
                this.errors.rxThrow<MemberOption[]>('MembersService.listMemberOptions'),
            );
    }
}