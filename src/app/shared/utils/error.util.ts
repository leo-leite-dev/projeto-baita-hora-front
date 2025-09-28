export function extractErrorMessage(err: any): string {
    if (!err) return 'Erro inesperado. Tente novamente.';

    const body = err.error ?? err;

    return (
        body?.detail ??
        body?.title ??
        body?.message ??
        (typeof body === 'string' ? body : undefined) ??
        'Erro inesperado. Tente novamente.'
    );
}