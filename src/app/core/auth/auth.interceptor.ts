import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environments';

function isApiUrl(url: string): boolean {
  if (url.startsWith('http://') || url.startsWith('https://'))
    return url.startsWith(environment.apiBaseUrl);

  return true;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastr: ToastrService) { }

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

        if (!skipRedirect && (error.status === 401 || error.status === 403)) {
          this.toastr.error('Sessão expirada. Faça login novamente.', 'Acesso negado');
          return throwError(() => error);
        }

        if (error.status >= 500)
          this.toastr.error('Erro interno no servidor', 'Erro');

        return throwError(() => error);
      })
    );
  }
}