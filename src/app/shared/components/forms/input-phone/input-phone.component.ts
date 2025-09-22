import { CommonModule } from '@angular/common';
import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter,
  forwardRef, Input, OnDestroy, Output, ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import intlTelInput from 'intl-tel-input/intlTelInputWithUtils';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

declare const intlTelInputUtils: any;

@Component({
  selector: 'app-input-phone',
  standalone: true,
  imports: [CommonModule, NgxMaskDirective],
  templateUrl: './input-phone.component.html',
  styleUrls: ['./input-phone.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputPhoneComponent), multi: true },
    // provê ngx-mask aqui (ou no AppModule, se preferir)
    provideNgxMask()
  ]
})
export class InputPhoneComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input() label = 'Telefone';
  @Input() inputId = `input-phone-${Math.random().toString(36).substring(2, 9)}`;

  /** Máscara fixa para BR (celular) — pode customizar se quiser */
  @Input() brMask = '(00) 00000-0000';

  @ViewChild('telInput', { static: true }) telInput!: ElementRef<HTMLInputElement>;

  @Output() changed = new EventEmitter<{ e164: string; isValid: boolean; country: any }>();

  iti?: ReturnType<typeof intlTelInput>;
  showError = false;

  /** máscara atual aplicada no input (ngx-mask) */
  currentMask = '00000000000';

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  // listeners
  private inputListener = () => this.syncToFormAndPlugin();
  private blurListener = () => { this.onTouched(); this.syncToFormAndPlugin(); };
  private countryListener = () => { this.updateMaskForCountry(); this.syncToFormAndPlugin(true); };

  ngAfterViewInit(): void {
    // intl-tel-input apenas para país/DDI/placeholder/format
    this.iti = intlTelInput(this.telInput.nativeElement, {
      initialCountry: 'br',
      separateDialCode: true,  // DDI fora do input
      nationalMode: true,      // usuário digita só o nacional
      autoPlaceholder: 'aggressive',
      formatOnDisplay: true,
      containerClass: 'bh-input-phone',
    });

    // máscara inicial (BR)
    this.updateMaskForCountry();

    const el = this.telInput.nativeElement;
    el.addEventListener('input', this.inputListener);
    el.addEventListener('blur', this.blurListener);
    el.addEventListener('countrychange', this.countryListener);
  }

  ngOnDestroy(): void {
    const el = this.telInput?.nativeElement;
    if (el) {
      el.removeEventListener('input', this.inputListener);
      el.removeEventListener('blur', this.blurListener);
      el.removeEventListener('countrychange', this.countryListener);
    }
    this.iti?.destroy();
  }

  // ===== CVA =====
  writeValue(value: string | null): void {
    if (!this.iti) return;
    this.iti.setNumber(value || '');
    // garante que o visível respeita a máscara
    this.syncToFormAndPlugin(true);
  }

  registerOnChange(fn: (val: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.telInput?.nativeElement?.toggleAttribute('disabled', isDisabled);
  }

  // ===== Máscara dinâmica por país =====
  private updateMaskForCountry(): void {
    if (!this.iti) return;
    const iso2 = this.iti.getSelectedCountryData().iso2;

    if (iso2 === 'br') {
      // BR: celular 11 dígitos
      this.currentMask = this.brMask;
      return;
    }

    // tenta gerar máscara a partir do EXEMPLO nacional
    const tryType = (type: number) => {
      try {
        const ex = intlTelInputUtils.getExampleNumber(iso2, true, type) as string | undefined;
        if (!ex) return '';
        // transforma "01 234 5678" em "00 000 0000"
        return ex.replace(/\d/g, '0');
      } catch { return ''; }
    };

    this.currentMask =
      tryType(intlTelInputUtils.numberType.MOBILE) ||
      tryType(intlTelInputUtils.numberType.FIXED_LINE_OR_MOBILE) ||
      '000000000000000'; // fallback simples
  }

  /** Quantos dígitos a máscara permite (conta zeros) */
  private nsnMaxFromMask(): number {
    return (this.currentMask.match(/0/g) || []).length;
  }

  // ===== Sincronização máscara ⇄ plugin ⇄ Form =====
  private syncToFormAndPlugin(forceFormat = false): void {
    if (!this.iti) return;

    const el = this.telInput.nativeElement;
    const digits = (el.value.match(/\d/g) || []).join('');
    const limit = this.nsnMaxFromMask();
    const trimmed = digits.slice(0, limit); // ngx-mask já limita, mas garantimos

    // monta E.164: +DDI + nacional
    const dial = this.iti.getSelectedCountryData().dialCode || '';
    const e164 = dial ? `+${dial}${trimmed}` : `+${trimmed}`;

    // joga no plugin para manter placeholder/format bonitinho
    // como estamos em nationalMode, podemos setar nacional que ele formata
    if (forceFormat) {
      // reformatar visível com base no que tem
      this.iti.setNumber(e164);
    } else {
      // evita flicker enquanto digita: só se mudou demais
      const curE164 = this.iti.getNumber(intlTelInputUtils.numberFormat.E164) || '';
      if (curE164 !== e164) this.iti.setNumber(e164);
    }

    // validação pelo plugin
    const isValid = !!this.iti.isValidNumber();

    // erro visual
    this.showError = !!el.value && !isValid;

    // envia pro formulário (CVA)
    this.onChange(e164);
    this.changed.emit({ e164, isValid, country: this.iti.getSelectedCountryData() });
  }
}
