import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environments";
import { HttpClient } from "@angular/common/http";
import { ErrorHandlingService } from "../../../../shared/services/error-handling.service";
import { Observable } from "rxjs";
import { Position, PositionEdit } from "../models/position.model";
import { ActivatePositionsRequest, CreatePositionRequest, DisablePositionsRequest, PatchPositionRequest } from "../contracts/position-request.contract";

@Injectable({ providedIn: "root" })
export class PositionsService {
  private readonly api = `${environment.apiBaseUrl}/companies/positions`;

  private http = inject(HttpClient);
  private errors = inject(ErrorHandlingService);

  listAll(): Observable<Position[]> {
    return this.http
      .get<Position[]>(this.api)
      .pipe(this.errors.rxThrow<Position[]>("PositionsService.list"));
  }

  getById(id: string): Observable<PositionEdit> {
    return this.http
      .get<Position>(`${this.api}/${id}`)
      .pipe(this.errors.rxThrow<Position>("PositionsService.getById"));
  }

  create(payload: CreatePositionRequest): Observable<void> {
    return this.http
      .post<void>(this.api, payload)
      .pipe(this.errors.rxThrow<void>("PositionsService.create"));
  }

  patch(positionId: string, payload: PatchPositionRequest): Observable<void> {
    return this.http
      .patch<void>(`${this.api}/${positionId}`, payload)
      .pipe(this.errors.rxThrow<void>("PositionsService.patch"));
  }

  delete(positionId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.api}/${positionId}`)
      .pipe(this.errors.rxThrow<void>("PositionsService.remove"));
  }

  activateMany(positionIds: string[]): Observable<void> {
    const body: ActivatePositionsRequest = { positionIds };
    return this.http
      .patch<void>(`${this.api}/activate`, body)
      .pipe(this.errors.rxThrow<void>("PositionsService.activateMany"));
  }

  disableMany(positionIds: string[]): Observable<void> {
    const body: DisablePositionsRequest = { positionIds };
    return this.http
      .patch<void>(`${this.api}/disable`, body)
      .pipe(this.errors.rxThrow<void>("PositionsService.disableMany"));
  }

  listPositionActiveOptions(search: string = "", take: number = 20): Observable<PositionOptions[]> {
    const params: Record<string, string> = {};

    if (search)
      params["search"] = search;

    if (take)
      params["take"] = String(take);

    return this.http
      .get<PositionOptions[]>(`${this.api}/options`, { params })
      .pipe(this.errors.rxThrow<PositionOptions[]>("PositionsService.listActiveOptions"));
  }
}