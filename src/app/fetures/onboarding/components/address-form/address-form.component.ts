import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, catchError, of, tap } from 'rxjs';
import { InputTextComponent } from '../../../../shared/components/forms/input-text/input-text.component';
import { FieldErrorsComponent } from '../../../../shared/components/field-errors/field-errors.component';
import { CepService } from '../../../../shared/services/cep.service';

export type AddressForm = {
  street: FormControl<string>;
  number: FormControl<string>;
  complement: FormControl<string>;
  neighborhood: FormControl<string>;
  city: FormControl<string>;
  state: FormControl<string>;
  zipCode: FormControl<string>;
};

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextComponent, FieldErrorsComponent],
  templateUrl: './address-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) group!: FormGroup<AddressForm>;

  private cepService = inject(CepService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    const zipCtrl = this.group.controls.zipCode;

    zipCtrl.valueChanges
      .pipe(
        map((v) => (v ?? '').toString().replace(/\D/g, '')),
        debounceTime(300),
        distinctUntilChanged(),
        tap((digits) => {
          if (digits.length < 8) {
            this.group.patchValue(
              {
                street: '',
                neighborhood: '',
                city: '',
                state: '',
              },
              { emitEvent: false }
            );
            this.cdr.markForCheck();
          }
        }),
        filter((digits) => digits.length === 8),
        switchMap((digits) =>
          this.cepService.buscarCep(digits).pipe(catchError(() => of({ erro: true })))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((dados: any) => {
        if (dados?.erro) return;

        this.group.patchValue(
          {
            street: dados.logradouro ?? '',
            neighborhood: dados.bairro ?? '',
            city: dados.localidade ?? '',
            state: dados.uf ?? '',
          },
          { emitEvent: false }
        );

        this.group.markAsDirty();
        this.group.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}