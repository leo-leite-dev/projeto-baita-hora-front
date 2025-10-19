import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { GenericModule } from '../../../../../../shareds/common/GenericModule';
import { ButtonComponent } from '../../../../../shared/components/buttons/button/button.component';
import { BackButtonComponent } from '../../../../../shared/components/buttons/back-button/back-button.component';
import { MemberAdminEditView } from '../../models/member-edit.model';
import { MembersService } from '../../services/member.service';
import { PatchMemberRequest } from '../../contracts/patch-member-request';
import { MemberEditForm, MemberEditFormComponent } from '../../form/member-edit-form/member-edit-form.component';
import { MemberEditFacade } from '../../data/member-edit.facade';

@Component({
    selector: 'app-member-edit',
    standalone: true,
    imports: [
        GenericModule,
        ButtonComponent,
        BackButtonComponent,
        MemberEditFormComponent
    ],
    templateUrl: './member-edit.component.html',
    styleUrls: ['./member-edit.component.scss'],
})
export class MemberEditComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private service = inject(MembersService);
    private toastr = inject(ToastrService);
    public facade = inject(MemberEditFacade);

    headerTitle$ = this.facade.headerTitle$;
    member$ = this.facade.memberStrict$;

    form!: FormGroup<MemberEditForm>;
    submitting = false;
    loaded = false;

    private initial!: MemberAdminEditView;
    private id!: string;

    ngOnInit(): void {
        this.buildForm();
        this.initData();
    }

    private buildForm(): void {
        this.form = this.fb.group({
            email: this.fb.control('', {
                nonNullable: true,
                validators: [
                    Validators.required,
                    Validators.email,
                    Validators.maxLength(255),
                ],
            }),
            cpf: this.fb.control('', {
                nonNullable: true,
                validators: [
                    Validators.required,
                    Validators.pattern(/^\d{11}$/),
                ],
            }),
            rg: this.fb.control<string | null>(null, {
                nonNullable: false,
                validators: [
                    Validators.maxLength(20),
                ],
            }),
        });
    }

    private initData(): void {
        this.member$.pipe(take(1)).subscribe({
            next: (member) => {
                this.id = member.memberId;
                this.initial = member;

                this.form.setValue(
                    {
                        email: member.email ?? '',
                        cpf: member.cpf ?? '',
                        rg: member.rg ?? null,
                    },
                    { emitEvent: false }
                );

                this.form.markAsPristine();
                this.loaded = true;
            },
            error: () => {
                this.toastr.error('Membro não encontrado.');
                this.router.navigate(['/app/member/list']);
            },
        });
    }

    submit(): void {
        if (this.form.invalid || !this.id) {
            this.form.markAllAsTouched();
            return;
        }

        const raw = this.form.getRawValue();
        const diff: PatchMemberRequest = {};

        if (raw.email !== this.initial.email)
            (diff as any).email = raw.email;

        if (raw.cpf !== this.initial.cpf)
            (diff as any).cpf = raw.cpf;

        if ((raw.rg ?? null) !== (this.initial.rg ?? null))
            (diff as any).rg = raw.rg ?? null;

        if (Object.keys(diff).length === 0) {
            this.toastr.info('Nada para salvar.');
            return;
        }

        this.submitting = true;
        this.form.disable();

        this.service
            .patch(this.id, diff)
            .pipe(
                take(1),
                finalize(() => {
                    this.submitting = false;
                    this.form.enable({ emitEvent: false });
                })
            )
            .subscribe({
                next: () => {
                    this.toastr.success('Dados do membro atualizados!');
                    this.router.navigate(['/app/member/list']);
                },
                error: (err) => {
                    const msg =
                        err?.error?.message ||
                        err?.message ||
                        'Falha ao atualizar os dados do membro.';

                    if (err?.status === 409) {
                        this.toastr.warning(msg, 'Atenção', {
                            toastClass: 'ngx-toastr custom-toast toast-warning',
                        });
                        if (String(msg).toLowerCase().includes('email'))
                            this.form.get('email')?.setErrors({ duplicate: true });
                        if (String(msg).toLowerCase().includes('cpf'))
                            this.form.get('cpf')?.setErrors({ duplicate: true });
                        return;
                    }

                    this.form.setErrors({ server: msg });
                    this.toastr.error(msg);
                },
            });
    }

    revert(): void {
        if (!this.initial) return;

        this.form.setValue(
            {
                email: this.initial.email ?? '',
                cpf: this.initial.cpf ?? '',
                rg: this.initial.rg ?? null,
            },
            { emitEvent: false }
        );

        this.form.markAsPristine();
    }
}