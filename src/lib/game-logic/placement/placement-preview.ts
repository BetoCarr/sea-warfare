import type { Position, Ship } from "@/lib/utils/types";
// import { getShipCoordinates, canPlaceShipAt } from "../ship-plaement";
import { getShipCoordinates, canPlaceShipAt } from "../ships/ship-placement";
import type { PlacementIntent, PlacementPreview } from "./placement-types";

export function previewPlacement(
    intent: PlacementIntent,
    boardSize: number,
    existingShips: Ship[]
): PlacementPreview {
    
    const tempShip: Ship = {
        id: intent.ship.id,
        type: intent.ship.type,
        size: intent.ship.size,
        position: intent.position,
        orientation: intent.orientation,
        hits: [],
        isSunk: false,
    };

    const occupiedCells: Position[] = getShipCoordinates(tempShip);

    const isValid = canPlaceShipAt(
        tempShip,
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
