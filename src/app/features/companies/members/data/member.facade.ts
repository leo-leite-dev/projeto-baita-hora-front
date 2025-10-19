import { Injectable } from '@angular/core';
import { BaseActivableFacade } from '../../../../shared/facades/base-activable.facade';
import { Member } from '../models/member.model';
import { MembersService } from '../services/member.service';

@Injectable({ providedIn: 'root' })
export class MemberFacade extends BaseActivableFacade<Member> {
    constructor(api: MembersService) {
        super(api);
    }
}