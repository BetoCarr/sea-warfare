import type { Position, Ship } from "@/lib/utils/types";
import { getShipCoordinates, canPlaceShipAt } from "../ships/ship-placement";
import type { PlacementIntent, PlacementPreview } from "./placement-types";

export function previewPlacement(
    intent: PlacementIntent,
    boardSize: number,
    existingShips: Ship[]
): PlacementPreview {
    
    // Minimal object required for placement logic
    const placementInfo = {
        type: intent.ship.type,
        size: intent.ship.size,
        position: intent.position,
        orientation: intent.orientation,
    };

    const occupiedCells: Position[] = getShipCoordinates(placementInfo);

    const isValid = canPlaceShipAt(
        placementInfo,
        intent.position,
        intent.orientation,
        boardSize,
        existingShips
    );

    return {
        intent,
        result: isValid ? "valid" : "invalid",
        occupiedCells,
    };
}
