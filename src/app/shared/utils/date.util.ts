export class DateUtil {
    static todayYmdLocal(d = new Date()): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    static toIsoStartOfDay(localYmd: string): string {
        const [y, m, d] = DateUtil.#parseYmd(localYmd);
        const dtLocalStart = new Date(y, m - 1, d, 0, 0, 0, 0);
        return dtLocalStart.toISOString();
    }

    static toIsoEndOfDay(localYmd: string): string {
        const [y, m, d] = DateUtil.#parseYmd(localYmd);
        const dtLocalEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
        return dtLocalEnd.toISOString();
    }

    static toLocalDate(localYmd: string): Date {
        const [y, m, d] = DateUtil.#parseYmd(localYmd);
        return new Date(y, m - 1, d);
    }

    static isValidYmd(localYmd?: string): boolean {
        if (!localYmd || typeof localYmd !== 'string') return false;
        const [y, m, d] = localYmd.split('-').map(Number);
        if (!y || !m || !d) return false;
        const dt = new Date(y, m - 1, d);
        return dt.getFullYear() === y && dt.getMonth() === (m - 1) && dt.getDate() === d;
    }

    static #parseYmd(ymd: string): [number, number, number] {
        const parts = ymd.split('-').map(Number);
        if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) {
            throw new Error(`Invalid YYYY-MM-DD: "${ymd}"`);
        }
        return parts as [number, number, number];
    }
}