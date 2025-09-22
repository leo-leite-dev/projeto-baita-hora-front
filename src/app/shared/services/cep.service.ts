import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CepService {
  private http = inject(HttpClient);

  buscarCep(cep: string): Observable<any> {
    const cleanCep = cep.replace(/\D/g, ''); 
    return this.http.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
  }
}