import { Injectable } from '@angular/core';
import { CreateUserRequest } from '../../../shared/contracts/CreateUserRequest';
import { CreateCompanyRequest } from '../../../shared/contracts/CreateCompanyRequest';
import { OnboardingDraft } from '../models/onboarding-draft.model';

const OWNER_KEY = 'onboarding.owner.draft';
const COMPANY_KEY = 'onboarding.company.draft';

@Injectable({ providedIn: 'root' })
export class OnboardingDataService {
  snapshot: OnboardingDraft = {};

  get ownerDraft(): Partial<CreateUserRequest> | null {
    try {
      const raw = sessionStorage.getItem(OWNER_KEY);
      return raw ? (JSON.parse(raw) as Partial<CreateUserRequest>) : null;
    } catch {
      return null;
    }
  }

  saveOwnerDraft(value: Partial<CreateUserRequest>): void {
    try {
      sessionStorage.setItem(OWNER_KEY, JSON.stringify(value));
      this.snapshot.owner = { ...(this.snapshot.owner || {}), ...value } as CreateUserRequest;
    } catch {}
  }

  clearOwnerDraft(): void {
    sessionStorage.removeItem(OWNER_KEY); 
    if (this.snapshot.owner) delete this.snapshot.owner;
  }

  get companyDraft(): Partial<CreateCompanyRequest> | null {
    try {
      const raw = sessionStorage.getItem(COMPANY_KEY); 
      return raw ? (JSON.parse(raw) as Partial<CreateCompanyRequest>) : null;
    } catch {
      return null;
    }
  }

  saveCompanyDraft(value: Partial<CreateCompanyRequest>): void {
    try {
      sessionStorage.setItem(COMPANY_KEY, JSON.stringify(value)); 
      this.snapshot.company = { ...(this.snapshot.company || {}), ...value } as CreateCompanyRequest;
    } catch {}
  }

  clearCompanyDraft(): void {
    sessionStorage.removeItem(COMPANY_KEY); 
    if (this.snapshot.company) delete this.snapshot.company;
  }

  setOwner(owner: Partial<CreateUserRequest>): void {
    this.saveOwnerDraft(owner);
  }

  clearAll(): void {
    this.clearOwnerDraft();
    this.clearCompanyDraft();
    this.snapshot = {};
  }
}