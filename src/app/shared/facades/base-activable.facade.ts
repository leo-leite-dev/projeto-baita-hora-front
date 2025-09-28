import { Observable } from 'rxjs';

export interface ActivableApi<T> {
    activateMany(ids: string[]): Observable<void>;
    disableMany(ids: string[]): Observable<void>;
    listAll(): Observable<T[]>;
}

export abstract class BaseActivableFacade<T> {
    protected constructor(protected api: ActivableApi<T>) { }

    activateMany = (ids: string[]) => this.api.activateMany(ids);
    disableMany = (ids: string[]) => this.api.disableMany(ids);
    listAll = () => this.api.listAll();
}