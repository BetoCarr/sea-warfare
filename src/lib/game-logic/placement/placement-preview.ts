import type { ShipPlacementInfo } from "@/lib/utils/types";
import type { PlacementIntent, PlacementPreview } from "./placement-types";
import { toShipPlacement } from "./placement-adapters";
import { getShipCoordinates, canPlaceShipAt } from "../ships/ship-placement";

export function previewPlacement(
    intent: PlacementIntent,
    boardSize: number,
    existingShips: ShipPlacementInfo[]
): PlacementPreview {
    
    const placement = toShipPlacement(intent);
    const occupiedCells = getShipCoordinates(placement);

    const isValid = canPlaceShipAt(
        intent,
        boardSize,
        existingShips
    );

    return {
        intent,
        result: isValid ? "valid" : "invalid",
        occupiedCells,
    };
}
