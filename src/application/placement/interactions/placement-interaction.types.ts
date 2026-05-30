import { ShipType } from '@/lib/domain/ships/models/ShipType';
import { Position } from '@/lib/domain/shared/models/Position';
import { Orientation } from '@/lib/domain/placement/models/Orientation';

export type PlacementInteractionState = {
    selectedShipType: ShipType | null;

    orientation: Orientation;

    hoveredCell: Position | null;
};