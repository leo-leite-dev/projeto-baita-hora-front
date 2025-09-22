import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MonoTypeOperatorFunction, Observable, catchError, throwError } from 'rxjs';

interface ProblemDetails {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
}

export interface NormalizedError {
  message: string;
  status: number;
}

interface ValidationProblemDetails extends ProblemDetails {
    errors?: Record<string, string[]>;
}

function isHttpError(e: unknown): e is HttpErrorResponse {
    return e instanceof HttpErrorResponse;
}

function isValidationProblem(e: any): e is ValidationProblemDetails {
    return e && typeof e === 'object' && ('errors' in e) && typeof e.errors === 'object';
}

function isProblem(e: any): e is ProblemDetails {
    return e && typeof e === 'object' && ('title' in e || 'detail' in e || 'status' in e);
}

export function isNormalizedError(err: unknown): err is NormalizedError {
  return !!err && typeof (err as any).message === 'string' && typeof (err as any).status === 'number';
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlingService {
    parse(error: unknown): { message: string; status: number } {
        const err = isHttpError(error) ? error : new HttpErrorResponse({ error });

        if (err.status === 0) {
            return { status: 0, message: 'Erro de conexão com o servidor.' };
        }

        const raw = err.error;

        if (err.status === 400 && isValidationProblem(raw) && raw.errors) {
            const flat = Object.entries(raw.errors)
                .flatMap(([field, msgs]) => (msgs ?? []).map(m => `${field}: ${m}`))
                .join(' • ');
            const message = flat || raw.detail || 'Erro de validação.';
            return { status: 400, message };
        }

        if (isProblem(raw)) {
            const title = raw.title?.trim();
            const detail = raw.detail?.trim();
            const message = [title, detail].filter(Boolean).join(' — ') ||
                err.message || 'Erro ao processar a requisição.';
            return { status: err.status, message };
        }

        if (typeof raw === 'string' && raw.trim().length > 0) {
            return { status: err.status, message: raw };
        }

        const byStatus: Record<number, string> = {
            401: 'Sessão inválida ou expirada.',
            403: 'Você não tem permissão para acessar este recurso.',
            404: 'Recurso não encontrado.',
            500: 'Erro interno no servidor.',
            502: 'Erro de gateway. O servidor está indisponível.',
            503: 'Serviço temporariamente indisponível.'
        };

        const fallback = byStatus[err.status] ?? (err.message || 'Algo deu errado. Por favor, tente novamente.');
        return { status: err.status, message: fallback };
    }

    handleWithThrow = (error: unknown) => {
        const { message, status } = this.parse(error);
        console.error('[HTTP]', status, message);
        return throwError(() => ({ message, status }));
    };

    handleWithLog(error: unknown, context?: string): string {
        const { message, status } = this.parse(error);
        console.error(context ? `[${context}]` : '[HTTP]', status, message);
        return message;
    }

    rxThrow<T>(context?: string): MonoTypeOperatorFunction<T> {
        return (source: Observable<T>) =>
            source.pipe(
                catchError(err => {
                    const { message, status } = this.parse(err);
                    if (context) console.error(`[${context}]`, status, message);
                    return throwError(() => ({ message, status }));
                })
            );
    }
}