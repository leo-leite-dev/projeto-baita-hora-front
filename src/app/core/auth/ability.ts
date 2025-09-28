import { Injectable } from "@angular/core";
import { AuthContextService } from "./auth-context";
import { canManageCompany, canCreateServiceOffering, canDisableServiceOffering, canRemoveServiceOffering, canDisablePosition, canRemovePosition } from "./types";

@Injectable({ providedIn: "root" })
export class AbilityService {
    constructor(private auth: AuthContextService) { }

    canManageCompany() { return canManageCompany(this.auth.snapshot); }
    canCreateServiceOffering() { return canCreateServiceOffering(this.auth.snapshot); }
    canDisableServiceOffering() { return canDisableServiceOffering(this.auth.snapshot); }
    canRemoveServiceOffering() { return canRemoveServiceOffering(this.auth.snapshot); }
    canDisablePosition() { return canDisablePosition(this.auth.snapshot); }
    canRemovePosition() { return canRemovePosition(this.auth.snapshot); }
}