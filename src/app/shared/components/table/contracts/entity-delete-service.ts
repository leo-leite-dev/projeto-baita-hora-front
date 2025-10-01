import { Observable } from 'rxjs';

export interface EntityDeleteService<T extends { id: unknown }> {
    delete(id: T['id']): Observable<void>;
}