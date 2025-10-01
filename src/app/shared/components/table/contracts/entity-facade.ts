import { Observable } from 'rxjs';
import { HasIdActive } from '../../bulk-toolbar/models/bulk-selection.models';

export interface EntityFacade<T extends HasIdActive> {
    listAll(): Observable<T[]>;
    activateMany(ids: T['id'][]): Observable<void>;
    disableMany(ids: T['id'][]): Observable<void>;
}