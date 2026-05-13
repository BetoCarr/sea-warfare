import type { Position, Orientation, ShipPlacementInfo } from '@/lib/utils/types';
import type { PlacementIntent } from '@/lib/domain/placement/placement-types';
import { BOARD_SIZE } from '@/lib/utils/constants';
import { shipsOverlap } from './ship-validation';
import { toShipPlacement } from '../placement/placement-adapters';
/**
 * Returns all board coordinates occupied by a ship.
 */
export function getShipCoordinates(
    ship: ShipPlacementInfo
): Position[] {

    const { row, col } = ship.position;
    const { size, orientation } = ship;

    const coordinates: Position[] = [];

    for (let i = 0; i < size; i++) {
        coordinates.push(
            orientation === 'horizontal'
                ? { row, col: col + i }
                : { row: row + i, col }
        );
    }

    return coordinates;
}

/**
 * Determines whether a ship can be placed at a given position and orientation.
 * Validates board boundaries and overlap with existing ships.
 */
export function canPlaceShipAt(
    intent: PlacementIntent,
    boardSize: number = BOARD_SIZE,
    existingShips: readonly ShipPlacementInfo[] = []
): boolean {

    const placement = toShipPlacement(intent);

    // 1. Bounds validation
    for (const coord of getShipCoordinates(placement)) {
        if (
            coord.row < 0 ||
            coord.row >= boardSize ||
            coord.col < 0 ||
            coord.col >= boardSize
        ) {
            return false;
        }
    }

    // 2. Overlap validation
    return !existingShips.some(existing =>
        shipsOverlap(placement, existing)
    );
}

/**
 * Creates a valid ship placement on the board.
 * Throws an error if placement rules are violated.
 */
export function createShipPlacement(
    intent: PlacementIntent,
    boardSize: number = BOARD_SIZE,
    existingShips: readonly ShipPlacementInfo[] = []
): ShipPlacementInfo {

    if (!canPlaceShipAt(intent, boardSize, existingShips)) {
        throw new Error(`Cannot place ${intent.ship.type} at the specified position`);
    }

    return toShipPlacement(intent);

}

// ROTATEEEEEEEEEEEEEEEEEE
export function rotateShip(
    intent: PlacementIntent,
    boardSize: number = BOARD_SIZE,
    existingShips: readonly ShipPlacementInfo[] = []
): PlacementIntent {

    const newOrientation =
        intent.orientation === 'horizontal'
            ? 'vertical'
            : 'horizontal';

    const rotatedIntent: PlacementIntent = {
        ...intent,
        orientation: newOrientation,
    };

    const canRotate = canPlaceShipAt(
        rotatedIntent,
        boardSize,
        existingShips
    );

    return canRotate
        ? rotatedIntent
        : intent;
}
