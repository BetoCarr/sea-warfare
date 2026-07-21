import { canPlaceShip } from '../rules/canPlaceShip';

import { DEFAULT_BOARD_SIZE } from '@/lib/domain/board/models/BoardConfig';



import type { PlacementValidationError } from '../models/PlacementValidationError';

import type { ShipPlacement } from '../models/ShipPlacement';

type UpsertShipPlacementParams = {
    existingPlacements: ShipPlacement[];
    placement: ShipPlacement;
    boardSize?: number;
};

type UpsertShipPlacementResult =
    | {
        success: true;
        placements: ShipPlacement[];
    }
    | {
        success: false;
        error: PlacementValidationError;
    };

export function upsertShipPlacement({
    existingPlacements,
    placement,
    boardSize = DEFAULT_BOARD_SIZE,
}: UpsertShipPlacementParams): UpsertShipPlacementResult {

    const authoritativePlacements =
        existingPlacements.filter(
            existingPlacement =>
                existingPlacement.ship.type !==
                placement.ship.type,
        );

    const validation = canPlaceShip({
        boardSize,
        ship: placement.ship,
        origin: placement.origin,
        orientation: placement.orientation,
        existingPlacements:
            authoritativePlacements,
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
            ...authoritativePlacements,
            placement,
        ],
    };
}