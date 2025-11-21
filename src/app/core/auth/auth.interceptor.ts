import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environments';

function isApiUrl(url: string): boolean {
  if (url.startsWith('http://') || url.startsWith('https://'))
    return url.startsWith(environment.apiBaseUrl);

  return true;
}

function getDetail(err: any): string | undefined {
  const body = err?.error ?? err;
  return (
    body?.detail ??
    body?.title ??
    body?.message ??
    (Array.isArray(body?.errors) ? body.errors.map((e: any) => e?.message).filter(Boolean).join('\n') : undefined) ??
    (typeof body === 'string' ? body : undefined)
  );
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private toastr: ToastrService) { }

  intercept<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    const isApi = isApiUrl(req.url);
    const request = isApi ? req.clone({ withCredentials: true }) : req;

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const url = req.url;

        const isAuthEndpoint =
          url.includes('/auth/login') ||
          url.includes('/auth/me') ||
          url.includes('/auth/refresh') ||
          url.includes('/auth/select-company');

        if (isAuthEndpoint) 
          return throwError(() => error);

        const skipRedirect = req.headers.get('X-Skip-Auth-Redirect') === '1';
        const msg = getDetail(error);

        if (error.status === 0) {
          this.toastr.error('Falha de conexão. Tenta novamente mais tarde.', 'Rede');
          return throwError(() => error);
        }

        if (!skipRedirect && error.status === 401) {
          this.toastr.error('Sessão expirada. Faça login novamente.', 'Autenticação');
          return throwError(() => error);
        }

        if (error.status === 403) {
          this.toastr.error(msg || 'Acesso negado. Permissão insuficiente.', 'Acesso negado');
          return throwError(() => error);
        }

        if (error.status >= 500) {
          this.toastr.error('Erro interno no servidor', 'Erro');
          return throwError(() => error);
        }

        return throwError(() => error);
      })
    );
  }
}