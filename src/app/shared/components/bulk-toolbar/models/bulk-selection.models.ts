export type Id = string | number;

export interface HasIdActive {
    id: Id;
    isActive: boolean;
}

export interface HasIdActiveName extends HasIdActive {
    name: string;
}

export type ActionLock = 'enable' | 'disable' | null;

export type RefineChoice = 'keep-actives' | 'keep-inactives' | 'cancel';

export interface BulkSelectionData {
    selectionCount: number;
}