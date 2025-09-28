import { CreateUserRequest } from '../../../shared/contracts/CreateUserRequest';
import { CreateCompanyRequest } from '../../../shared/contracts/CreateCompanyRequest';

export interface OnboardingDraft {
    owner?: CreateUserRequest;
    company?: CreateCompanyRequest;
}