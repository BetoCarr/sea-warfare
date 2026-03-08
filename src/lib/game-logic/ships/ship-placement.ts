import type { Position, Orientation, ShipPlacementInfo, BaseShip } from '@/lib/utils/types';
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
export function getShipCoordinates(ship: ShipPlacementInfo): Position[] {
    const { row, col } = ship.position;
    const { size, orientation } = ship;

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
    ship: BaseShip,
    position: Position,
    orientation: Orientation,
    boardSize: number = BOARD_SIZE,
    existingShips: readonly ShipPlacementInfo[] = []
): boolean {

    const tempShip: ShipPlacementInfo = {
        ...ship,
        position,
        orientation
    };

    const coordinates = getShipCoordinates(tempShip);

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

    for (const existingShip of existingShips) {
        for (const coord of getShipCoordinates(existingShip)) {
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
    ship: BaseShip,
    position: Position,
    orientation: Orientation,
    boardSize: number = BOARD_SIZE,
    existingShips: ShipPlacementInfo[],
): ShipPlacementInfo {

    if (!canPlaceShipAt(ship, position, orientation, boardSize, existingShips)) {
        throw new Error(`Cannot place ${ship.type} at the specified position`);
    }

    return {
        ...ship,
        position: { ...position },
        orientation
    };
}

/**
 * Rotates a ship
 * - Toggles between horizontal and vertical
 * - Ensures rotation does not violate board boundaries or overlap existing ships
 * - If the ship has no position, simply toggles orientation
 */
export function rotateShip<T extends ShipPlacementInfo>(
    ship: T,
    boardSize: number = BOARD_SIZE,
    existingShips: ShipPlacementInfo[] = []
): T {
    if (!ship.position) {
        // No position yet, just toggle orientation
        return {
            ...ship,
            orientation: ship.orientation === 'horizontal' ? 'vertical' : 'horizontal'
        };
    }

    const newOrientation: Orientation = 
        ship.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    
    if (canPlaceShipAt(ship, ship.position, newOrientation, boardSize, existingShips)) {
        return {
            ...ship,
            orientation: newOrientation
        };
    }
    
    // Cannot rotate in current position, keep orientation unchanged
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