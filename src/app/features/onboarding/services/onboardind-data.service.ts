import { Injectable } from '@angular/core';
import { CreateUserRequest } from '../../../shared/contracts/user-request';
import { CreateCompanyRequest } from '../../../shared/contracts/company-request';
import { AddressFormValue, UserFormValue } from '../../../shared/components/forms/types/user-form-value';

const OWNER_KEY = 'onboarding.owner.draft';
const COMPANY_KEY = 'onboarding.company.draft';

export interface OnboardingDraft {
  owner?: Partial<CreateUserRequest>;
  company?: Partial<CreateCompanyRequest>;
}

@Injectable({ providedIn: 'root' })
export class OnboardingDataService {
  snapshot: OnboardingDraft = {};

  private parseDateOnly(s?: string | null): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    return (!y || !m || !d) ? null : new Date(y, m - 1, d);
  }

  private formatDateOnly(d?: Date | null): string | null {
    if (!d) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private dtoToForm(dto: Partial<CreateUserRequest>): Partial<UserFormValue> {
    return {
      ...dto,
      profile: dto.profile
        ? {
          ...dto.profile,
          rg: dto.profile.rg ?? null,
          birthDate: this.parseDateOnly(dto.profile.birthDate),
          address: dto.profile.address as AddressFormValue,
        }
        : undefined,
    } satisfies Partial<UserFormValue>;
  }

  private formToDto(val: Partial<UserFormValue>): Partial<CreateUserRequest> {
    return {
      ...val,
      profile: val.profile && {
        ...val.profile,
        birthDate: this.formatDateOnly(val.profile.birthDate),
      }
    };
  }

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
      this.snapshot.owner = { ...(this.snapshot.owner ?? {}), ...value };
    } catch { }
  }

  clearOwnerDraft(): void {
    sessionStorage.removeItem(OWNER_KEY);
    if (this.snapshot.owner) delete this.snapshot.owner;
  }

  setOwner(owner: Partial<CreateUserRequest>): void {
    this.saveOwnerDraft(owner);
  }

  getOwnerDraftForForm(): Partial<UserFormValue> | null {
    const dto = this.ownerDraft ?? this.snapshot.owner ?? null;
    return dto ? this.dtoToForm(dto) : null;
  }

  saveOwnerDraftFromForm(value: Partial<UserFormValue>): void {
    this.saveOwnerDraft(this.formToDto(value));
  }

  setOwnerFromForm(value: Partial<UserFormValue>): void {
    this.saveOwnerDraftFromForm(value);
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
      this.snapshot.company = { ...(this.snapshot.company ?? {}), ...value };
    } catch { }
  }

  clearCompanyDraft(): void {
    sessionStorage.removeItem(COMPANY_KEY);
    if (this.snapshot.company) delete this.snapshot.company;
  }

  clearAll(): void {
    this.clearOwnerDraft();
    this.clearCompanyDraft();
    this.snapshot = {};
  }
}