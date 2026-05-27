import type { ShipPlacement } from '../models/ShipPlacement';
import type { PlacementValidationError } from '../models/PlacementValidationError';
import { canPlaceShip } from '../rules/canPlaceShip';
import { DEFAULT_BOARD_SIZE } from '@/lib/domain/board/models/BoardConfig';

type PlaceShipParams = {
    existingPlacements: ShipPlacement[];
    placement: ShipPlacement;
    boardSize?: number;
};

type PlaceShipResult =
    | {
        success: true;
        placements: ShipPlacement[];
    }
    | {
        success: false;
        error: PlacementValidationError;
    };

export function placeShipOnBoard({
    existingPlacements,
    placement,
    boardSize = DEFAULT_BOARD_SIZE,
}: PlaceShipParams): PlaceShipResult {

    const validation = canPlaceShip({
        boardSize,
        ship: placement.ship,
        origin: placement.origin,
        orientation: placement.orientation,
        existingPlacements,
    });

    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
        };
    }

    return {
        success: true,
        placements: [
            ...existingPlacements,
            placement,
        ],
    };
}