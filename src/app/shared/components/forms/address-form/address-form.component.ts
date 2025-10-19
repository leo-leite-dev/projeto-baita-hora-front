import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, catchError, of, tap, startWith, finalize } from 'rxjs';
import { CepService } from '../../../services/cep.service';
import { FormGenericModule } from '../../../../../shareds/common/FormGenericModule';

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
  imports: [FormGenericModule],
  templateUrl: './address-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) group!: FormGroup<AddressForm>;

  private cepService = inject(CepService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  loading = false;
  notFound = false;

  ngOnInit(): void {
    const zipCtrl = this.group.controls.zipCode;

    zipCtrl.valueChanges
      .pipe(
        startWith(zipCtrl.value),
        map((v) => (v ?? '').toString().replace(/\D/g, '')),
        debounceTime(300),
        distinctUntilChanged(),
        tap((digits) => {
          this.notFound = false;
          if (digits.length < 8) {
            this.group.patchValue(
              { street: '' as any, neighborhood: '' as any, city: '' as any, state: '' as any },
              { emitEvent: false }
            );
            this.cdr.markForCheck();
          }
        }),
        filter((digits) => digits.length === 8),
        tap(() => { this.loading = true; this.cdr.markForCheck(); }),
        switchMap((digits) =>
          this.cepService.buscarCep(digits).pipe(
            catchError(() => of({ erro: true })),
            finalize(() => { this.loading = false; this.cdr.markForCheck(); })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((dados: any) => {
        if (dados?.erro) {
          this.notFound = true;
          this.cdr.markForCheck();
          return;
        }

        this.group.patchValue(
          {
            street: (dados.logradouro ?? '') as any,
            neighborhood: (dados.bairro ?? '') as any,
            city: (dados.localidade ?? '') as any,
            state: (dados.uf ?? '') as any,
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