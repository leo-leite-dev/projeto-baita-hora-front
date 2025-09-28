import { Injectable } from '@angular/core';
import { Position } from '../models/position.model';
import { BaseActivableFacade } from '../../../../shared/facades/base-activable.facade';
import { PositionsService } from '../services/positions.service';

@Injectable({ providedIn: 'root' })
export class PositionsFacade extends BaseActivableFacade<Position> {
    constructor(api: PositionsService) { super(api); }
}