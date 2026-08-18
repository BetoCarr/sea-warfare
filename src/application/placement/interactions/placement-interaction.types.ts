import type { Orientation } from '@/lib/domain/placement/models/Orientation';
import type { Position } from '@/lib/domain/shared/models/Position';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';

export type PlacementInteractionState = {
    selectedShipType: ShipType | null;
    orientation: Orientation;
    targetCell: Position | null; 
};

export type BoardCellInteraction = {
    position: Position;
    shipType?: ShipType;
};

export type PlacementInteractionResult =
    | { type: 'place-ship' }
    | null;