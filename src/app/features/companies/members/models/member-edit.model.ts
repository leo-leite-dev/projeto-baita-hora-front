import { MemberBase } from "./member-base";

export interface MemberAdminEditView extends MemberBase {
    email: string;
    cpf: string;
    rg?: string;
}