export function onlyDigits(v: string | null | undefined): string {
    return (v ?? '').replace(/\D+/g, '');
}

export function toIsoDate(v: Date | string | null | undefined): string | null {
    if (v == null)
        return null;

    if (v instanceof Date) {
        if (isNaN(v.getTime())) return null;
        const yyyy = v.getFullYear();
        const mm = String(v.getMonth() + 1).padStart(2, '0');
        const dd = String(v.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    const s = v.trim();
    if (!s)
        return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(s))
        return s;

    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m)
        return `${m[3]}-${m[2]}-${m[1]}`;

    const d = new Date(s);
    if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    return null;
}

export function parseDateOnly(s?: string | null): Date | null {
    if (!s) return null;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    return new Date(y, mo - 1, d);
}