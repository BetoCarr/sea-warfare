import type { Position, Orientation, ShipPlacementInfo, BaseShip } from '@/lib/utils/types';
import type { PlacementIntent } from '@/lib/game-logic/placement/placement-types';
import { BOARD_SIZE } from '@/lib/utils/constants';

/**
 * RESPONSIBILITY 2: POSITIONING AND PLACEMENT MANAGEMENT
 * 
 * This module handles:
 * 1. Calculating all coordinates occupied by a ship
 * 2. Validating if a ship can be placed at a given position
 * 3. Placing a ship on the board
 * 4. Rotating a ship while respecting board bounds and overlaps
 * 5. Removing a ship from the board
 */

/**
 * Returns all board coordinates occupied by a ship.
 */
export function getShipCoordinates(intent: PlacementIntent): Position[] {
    const { position, orientation, ship } = intent;
    const { row, col } = position;
    const size = ship.size;


    const coordinates: Position[] = [];

    for (let i = 0; i < size; i++) {
        coordinates.push(
            orientation === "horizontal"
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
    existingShips: readonly PlacementIntent[] = []
): boolean {

    const coordinates = getShipCoordinates(intent);

    // Check board boundaries
    for (const coord of coordinates) {
        if (
            coord.row < 0 ||
            coord.row >= boardSize ||
            coord.col < 0 ||
            coord.col >= boardSize
        ) {
            return false;
        }
    }

    // Build a set of occupied cells
    const occupiedCells = new Set<string>();

    for (const existingIntent of existingShips) {
        for (const coord of getShipCoordinates(existingIntent)) {
            occupiedCells.add(`${coord.row},${coord.col}`);
        }
    }

    // Check overlap
    for (const coord of coordinates) {
        if (occupiedCells.has(`${coord.row},${coord.col}`)) {
            return false;
        }
    }

    return true;
}

/**
 * Places a ship at a specific position and orientation on the board
 * - Throws an error if placement is invalid
 */
/**
 * Creates a valid ship placement on the board.
 * Throws an error if placement rules are violated.
 */
export function createShipPlacement(
    // ship: BaseShip,
    // position: Position,
    // orientation: Orientation,
    intent: PlacementIntent,
    boardSize: number = BOARD_SIZE,
    existingShips: readonly PlacementIntent[],
): ShipPlacementInfo {

    if (!canPlaceShipAt(intent, boardSize, existingShips)) {
        throw new Error(`Cannot place ${intent.ship.type} at the specified position`);
    }

    return {
        ...intent.ship,
        position: { ...intent.position },
        orientation: intent.orientation
    };
}

export function rotateShip<T extends ShipPlacementInfo>(
    ship: T,
    boardSize: number = BOARD_SIZE,
    existingShips: readonly PlacementIntent[] = []
): T {

    // 1. If no position → just toggle orientation (no validation needed)
    if (!ship.position) {
        return {
            ...ship,
            orientation:
                ship.orientation === 'horizontal'
                    ? 'vertical'
                    : 'horizontal'
        };
    }

    // 2. Compute next orientation
    const newOrientation: Orientation =
        ship.orientation === 'horizontal'
            ? 'vertical'
            : 'horizontal';

    // 3. Build intent (🔥 clave del refactor)
    const intent: PlacementIntent = {
        ship: {
            type: ship.type,
            size: ship.size
        },
        position: ship.position,
        orientation: newOrientation
    };

    const otherShips = existingShips.filter(s => 
        s.position.row !== ship.position!.row || 
        s.position.col !== ship.position!.col || 
        s.ship.type !== ship.type
    );

    // 4. Validate rotation
    const canRotate = canPlaceShipAt(
        intent,
        boardSize,
        otherShips
    );

    if (canRotate) {
        return {
            ...ship,
            orientation: newOrientation
        };
    }

    // 5. If invalid → keep original
    return ship;
}
/**
 * Removes a ship from the board by clearing its position
 */
export function removeShipFromBoard<T extends ShipPlacementInfo>(ship: T): T & { position: undefined } {
    return {
        ...ship,
        position: undefined
    };
}