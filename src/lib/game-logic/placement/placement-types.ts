import type { Position, Orientation } from '@/lib/utils/types';
import type { ShipSpec } from '@/lib/game-logic/ships/ship-spec';


// Value Object
export type PlacementIntent = {
    ship: ShipSpec;
    position: Position;
    orientation: Orientation;
};

export type PlacementPreviewResult = "valid" | "invalid";

// Result Object
export type PlacementPreview = {
    intent: PlacementIntent;
    result: PlacementPreviewResult
    occupiedCells: Position[];
};
