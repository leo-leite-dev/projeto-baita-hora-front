import { CreateUserRequest } from '../../../shared/contracts/user-request';
import { CreateCompanyRequest } from '../../../shared/contracts/company-request';

export interface OnboardingDraft {
    owner?: CreateUserRequest;
    company?: CreateCompanyRequest;
}