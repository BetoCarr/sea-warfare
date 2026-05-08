import type { Position, Orientation } from '@/lib/utils/types';
import type { BaseShip } from '@/lib/utils/types';

// Value Object
export type PlacementIntent = {
    ship: BaseShip;
    position: Position;
    orientation: Orientation;
};

export type PlacementPreviewResult = "valid" | "invalid";

// Result Object
export type PlacementPreview = {
    intent: PlacementIntent;
    occupiedCells: Position[];
    result: PlacementPreviewResult
};
