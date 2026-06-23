import { ShipType } from '@/lib/domain/ships/models/ShipType';
import { Position } from '@/lib/domain/shared/models/Position';
import { Orientation } from '@/lib/domain/placement/models/Orientation';

export type PlacementInteractionState = {
    selectedShipType: ShipType | null;

    orientation: Orientation;

    targetCell: Position | null; 

    activeShipOrigin: Position | null; // Agregar a la documentación y test.

};

export type BoardCellInteraction = {
    position: Position;
    shipType?: ShipType;
};