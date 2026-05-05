import type { Position, Ship } from "@/lib/utils/types";
import type { PlacementIntent, PlacementPreview } from "./placement-types";
import { getShipCoordinates, canPlaceShipAt } from "../ships/ship-placement";

export function previewPlacement(
    intent: PlacementIntent,
    boardSize: number,
    existingShips: Ship[]
): PlacementPreview {
    
    const occupiedCells: Position[] = getShipCoordinates(intent);

    const isValid = canPlaceShipAt(
        intent,
        boardSize,
        existingShips.map(ship => ({
            ship: { type: ship.type, size: ship.size },
            position: ship.position,
            orientation: ship.orientation
        }))
    );

    return {
        intent,
        result: isValid ? "valid" : "invalid",
        occupiedCells,
    };
}
