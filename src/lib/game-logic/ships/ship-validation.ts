import { SHIPS_CONFIG, BOARD_SIZE } from '@/lib/utils/constants';
import type { Ship, Position, Orientation, ShipType } from '@/lib/utils/types';
import { getShipCoordinates } from './ship-placement';
import { getDistanceBetweenShips } from './ship-queries';
import { getShipsByType } from './ship-queries';
import { validateShipConfig } from './ship-factory';
import { canPlaceShipAt } from './ship-placement';
/**
 * RESPONSIBILITY 5: ADVANCED VALIDATIONS
 * 
 * This module handles:
 * 1. Validating an entire fleet against game rules
 * 2. Checking overlaps and enforcing separation rules
 * 3. Ensuring ship data consistency and integrity
 * 4. Providing valid placement options for ships
 */

/**
 * Validates that a fleet is complete according to game rules
 */
export function validateFleet(ships: Ship[]): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Verify correct number of each ship type
    Object.entries(SHIPS_CONFIG).forEach(([shipType, config]) => {
        const shipsOfType = getShipsByType(ships, shipType as ShipType);
        if (shipsOfType.length !== config.count) {
            errors.push(
                `Expected ${config.count} ${config.name}(s), found ${shipsOfType.length}`
            );
        }
    });

    // Verify all ships are placed
    const unplacedShips = ships.filter(ship => !ship.position);
    if (unplacedShips.length > 0) {
        errors.push(`${unplacedShips.length} ship(s) not placed`);
    }
    
    // Verify overlaps
    for (let i = 0; i < ships.length; i++) {
        for (let j = i + 1; j < ships.length; j++) {
            if (shipsOverlap(ships[i], ships[j])) {
                errors.push(`Ships ${ships[i].id} and ${ships[j].id} overlap`);
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Checks if two ships overlap on the board
 */
export function shipsOverlap(ship1: Ship, ship2: Ship): boolean {
    if (!ship1.position || !ship2.position) return false;

    const coords1 = getShipCoordinates(ship1);
    const coords2 = getShipCoordinates(ship2);

    return coords1.some(coord1 => 
        coords2.some(coord2 => 
            coord1.row === coord2.row && coord1.col === coord2.col
        )
    );
}

/**
 * Validates that ships respect the minimum separation rule (optional)
 */
export function validateShipSeparation(
    ships: Ship[], 
    minDistance: number = 1
): {
    isValid: boolean;
    violations: Array<{ ship1: string; ship2: string; distance: number }>;
} {
    const violations: Array<{ ship1: string; ship2: string; distance: number }> = [];
    
    for (let i = 0; i < ships.length; i++) {
        for (let j = i + 1; j < ships.length; j++) {
            const distance = getDistanceBetweenShips(ships[i], ships[j]);
            if (distance < minDistance) {
                violations.push({
                    ship1: ships[i].id,
                    ship2: ships[j].id,
                    distance
                });
            }
        }
    }

    return {
        isValid: violations.length === 0,
        violations
    };
}

/**
 * Validates the internal consistency of a ship
 */
export function validateShipIntegrity(ship: Ship): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    
    // Validate basic configuration
    if (!validateShipConfig(ship)) {
        errors.push('Invalid basic configuration');
    }

    // Validate consistency of hits vs. isSunk
    const allHitsTrue = ship.hits.every(hit => hit);
    if (ship.isSunk && !allHitsTrue) {
        errors.push('Ship marked as sunk but not all hits are true');
    }
    if (!ship.isSunk && allHitsTrue) {
        errors.push('All hits are true but the ship is not marked as sunk');
    }

    // Validate position if present
    if (ship.position) {
        const coordinates = getShipCoordinates(ship);
        if (coordinates.length !== ship.size) {
            errors.push('Number of coordinates does not match ship size');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Gets all valid placements for a ship on the board
 */
export function getValidPlacements(
    ship: Ship,
    boardSize: number = BOARD_SIZE,
    existingShips: Ship[] = []
): Array<{ position: Position; orientation: Orientation }> {
    const validPlacements: Array<{ position: Position; orientation: Orientation }> = [];

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const position: Position = { row, col };
        
            // Test both orientations
            for (const orientation of ['horizontal', 'vertical'] as Orientation[]) {
                if (canPlaceShipAt(ship, position, orientation, boardSize, existingShips)) {
                    validPlacements.push({ position, orientation });
                }
            }
        }
    }

    return validPlacements;
}