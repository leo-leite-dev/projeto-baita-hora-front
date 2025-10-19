const toId = (x: any) => (x?.id ?? x?.fid ?? x?.value ?? x) as string;

export function extractIds(arr: any[] | null | undefined): string[] {
    return (arr ?? []).map(toId).filter((id: string) => !!id && typeof id === 'string');
}