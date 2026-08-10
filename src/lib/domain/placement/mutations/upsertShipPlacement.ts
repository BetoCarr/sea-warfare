import { canPlaceShip } from '../rules/canPlaceShip';

import { DEFAULT_BOARD_SIZE } from '@/lib/domain/board/models/BoardConfig';

import type { ShipPlacement } from '../models/ShipPlacement';

import type { UpsertShipPlacementResult } from '../models/UpsertShipPlacementResult';

type UpsertShipPlacementParams = {
    existingPlacements: ShipPlacement[];
    placement: ShipPlacement;
    boardSize?: number;
};

export function upsertShipPlacement({
    existingPlacements,
    placement,
    boardSize = DEFAULT_BOARD_SIZE,
}: UpsertShipPlacementParams): UpsertShipPlacementResult {

    const existingPlacement = existingPlacements.find(
        currentPlacement =>
            currentPlacement.ship.type === placement.ship.type,
    );

    const authoritativePlacements =
        existingPlacements.filter(
            currentPlacement =>
                currentPlacement.ship.type !==
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
        outcome: existingPlacement == null
            ? 'placed'
            : 'repositioned',
    };
}