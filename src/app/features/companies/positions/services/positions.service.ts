import { Observable } from "rxjs";
import { ActivatePositionsRequest, DisablePositionsRequest, PatchPositionRequest, RemoveServicesFromPositionRequest } from "../contracts/PatchPositionRequest";
import { CreatePositionResponse } from "../contracts/CreatePositionResponse";
import { CreatePositionRequest } from "../contracts/CreatePositionRequest";
import { Position } from "../models/position.model";
import { HttpClient } from "@angular/common/http";
import { ErrorHandlingService } from "../../../../shared/services/error-handling.service";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class PositionsService {
  private readonly API = "/api/companies/positions";

  constructor(
    private http: HttpClient,
    private errors: ErrorHandlingService
  ) { }

  listAll(): Observable<Position[]> {
    return this.http
      .get<Position[]>(this.API)
      .pipe(this.errors.rxThrow<Position[]>("PositionsService.list"));
  }

  create(payload: CreatePositionRequest): Observable<CreatePositionResponse> {
    return this.http
      .post<CreatePositionResponse>(this.API, payload)
      .pipe(this.errors.rxThrow<CreatePositionResponse>("PositionsService.create"));
  }

  patch(positionId: string, payload: PatchPositionRequest): Observable<{ positionId: string; positionName: string }> {
    return this.http
      .patch<{ positionId: string; positionName: string }>(`${this.API}/${positionId}`, payload)
      .pipe(this.errors.rxThrow("PositionsService.patch"));
  }

  delete(positionId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.API}/${positionId}`)
      .pipe(this.errors.rxThrow<void>("PositionsService.remove"));
  }

  removeServices(positionId: string, serviceOfferingIds: string[]): Observable<void> {
    const body: RemoveServicesFromPositionRequest = { serviceOfferingIds };
    return this.http
      .delete<void>(`${this.API}/${positionId}/services`, { body })
      .pipe(this.errors.rxThrow<void>("PositionsService.removeServices"));
  }

  activateMany(positionIds: string[]): Observable<void> {
    const body: ActivatePositionsRequest = { positionIds };
    return this.http
      .patch<void>(`${this.API}/activate`, body)
      .pipe(this.errors.rxThrow<void>("PositionsService.activateMany"));
  }

  disableMany(positionIds: string[]): Observable<void> {
    const body: DisablePositionsRequest = { positionIds };
    return this.http
      .patch<void>(`${this.API}/disable`, body)
      .pipe(this.errors.rxThrow<void>("PositionsService.disableMany"));
  }

  removeService(positionId: string, serviceOfferingId: string): Observable<void> {
    return this.removeServices(positionId, [serviceOfferingId]);
  }
}