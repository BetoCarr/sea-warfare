import { ShipType } from '@/lib/domain/ships/models/ShipType';
import { Orientation } from '@/lib/domain/placement/models/Orientation';
import { Position } from '@/lib/domain/shared/models/Position';


export type PlacementInteractionActions = {
    setSelectedShipType: (
        shipType: ShipType | null
    ) => void;

    setOrientation: (
        orientation: Orientation
    ) => void;

    setTargetCell: (
        position: Position | null
    ) => void;

    setActiveShipOrigin: (
        position: Position | null,
    ) => void;

    resetPlacementInteraction: () => void;
};