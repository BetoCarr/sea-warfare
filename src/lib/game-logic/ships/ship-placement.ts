import type { Ship, Position, Orientation } from '@/lib/utils/types';
import { createBoardState } from '../board/board-sync';
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
 * Returns all coordinates occupied by a ship based on its position and orientation
 */
export function getShipCoordinates(ship: Ship): Position[] {
    if (!ship.position) return [];
    
    const coordinates: Position[] = [];
    const { row, col } = ship.position;

    for (let i = 0; i < ship.size; i++) {
        if (ship.orientation === 'horizontal') {
            coordinates.push({ row, col: col + i });
        } else {
            coordinates.push({ row: row + i, col });
        }
    }

    return coordinates;
}

/**
 * Checks whether a ship can be placed at a specific position with a given orientation
 * - Validates board boundaries
 * - Ensures no overlap with existing ships
 */
export function canPlaceShipAt(
    ship: Ship,
    position: Position,
    orientation: Orientation,
    boardSize: number = BOARD_SIZE,
    existingShips: Ship[] = []
): boolean {
    // Temporary ship object for validation
    const tempShip: Ship = {
        ...ship,
        position,
        orientation
    };

    const coordinates = getShipCoordinates(tempShip);

    // Check board boundaries
    for (const coord of coordinates) {
        if (coord.row < 0 || coord.row >= boardSize ||
            coord.col < 0 || coord.col >= boardSize) {
            return false;
        }
    }

    // Check for overlap with existing ships
    for (const existingShip of existingShips) {
        if (existingShip.id === ship.id) continue; // Skip the same ship
        
        const existingCoords = getShipCoordinates(existingShip);
        for (const coord of coordinates) {
            for (const existingCoord of existingCoords) {
                if (coord.row === existingCoord.row && coord.col === existingCoord.col) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

/**
 * Places a ship at a specific position and orientation on the board
 * - Throws an error if placement is invalid
 */
export function placeShip(
    ship: Ship,
    position: Position,
    orientation: Orientation,
    boardSize: number = BOARD_SIZE,    
    existingShips: Ship[],
): Ship {
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
export function rotateShip(
    ship: Ship,
    boardSize: number = BOARD_SIZE,
    existingShips: Ship[] = []
): Ship {
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
export function removeShipFromBoard(ship: Ship): Ship {
    return {
        ...ship,
        position: undefined
    };
}