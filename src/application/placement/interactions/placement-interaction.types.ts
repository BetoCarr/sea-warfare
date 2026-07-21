import { Orientation } from '@/lib/domain/placement/models/Orientation';

import { Position } from '@/lib/domain/shared/models/Position';

import { ShipType } from '@/lib/domain/ships/models/ShipType';

export type PlacementInteractionState = {
    selectedShipType: ShipType | null;
    orientation: Orientation;
    targetCell: Position | null; 
};

export type BoardCellInteraction = {
    position: Position;
    shipType?: ShipType;
};