import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, shareReplay } from 'rxjs';

export type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ddd?: string;
  ibge?: string;
  gia?: string;
  siafi?: string;
  erro?: boolean;
};

@Injectable({ providedIn: 'root' })
export class CepService {
  private http = inject(HttpClient);

  private cache = new Map<string, Observable<ViaCepResponse>>();

  buscarCep(cep: string): Observable<ViaCepResponse> {
    const cleanCep = (cep ?? '').replace(/\D/g, '');

    if (cleanCep.length !== 8)
      return of({ erro: true });


    const cached = this.cache.get(cleanCep);
    if (cached) return cached;

    const req$ = this.http
      .get<ViaCepResponse>(`https://viacep.com.br/ws/${cleanCep}/json/`)
      .pipe(
        map((res) => {
          if (!res || (res as any).erro)
            return { erro: true } as ViaCepResponse;

          return {
            ...res,
            uf: (res.uf ?? '').toUpperCase(),
          } as ViaCepResponse;
        }),
        catchError(() => of({ erro: true } as ViaCepResponse)),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    this.cache.set(cleanCep, req$);
    return req$;
  }
}