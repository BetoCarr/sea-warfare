import type { ShipPlacement } from '../models/ShipPlacement';
import type { PlacementValidationError } from '../models/PlacementValidationError';

import { removeShipPlacement } from './removeShipPlacement';
import { placeShipOnBoard } from './placeShipOnBoard';

import { DEFAULT_BOARD_SIZE } from '@/lib/domain/board/models/BoardConfig';

type ReplaceShipPlacementParams = {
    existingPlacements: ShipPlacement[];

    placement: ShipPlacement;

    boardSize?: number;
};

type ReplaceShipPlacementResult =
    | {
        success: true;
        placements: ShipPlacement[];
    }
    | {
        success: false;
        error: PlacementValidationError;
    };

export function replaceShipPlacement({
    existingPlacements,
    placement,
    boardSize = DEFAULT_BOARD_SIZE,
}: ReplaceShipPlacementParams): ReplaceShipPlacementResult {

    const placementsWithoutShip =
        removeShipPlacement({
            placements: existingPlacements,
            shipType: placement.ship.type,
        });

    return placeShipOnBoard({
        existingPlacements: placementsWithoutShip,
        placement,
        boardSize,
    });
}