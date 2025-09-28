export interface HasIdActive {
    id: string | number;
    isActive: boolean;
}

export type ActionLock = 'enable' | 'disable' | null;

export type RefineChoice = 'keep-actives' | 'keep-inactives' | 'cancel';

export interface BulkSelectionData {
    selectionCount: number;
}