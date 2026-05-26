import { SHIPS_CONFIG, BOARD_SIZE } from '@/lib/utils/constants';
import type { ShipPlacementInfo } from '@/lib/utils/types';
import type { Position } from '@/lib/domain/shared/models/Position';
import type { Orientation } from '@/lib/domain/placement/models/Orientation';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';
import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';
import type { PlacementIntent } from '@/lib/domain/placement/placement-types';
import { getShipCoordinates } from './ship-placement';
import { getDistanceBetweenShips } from './ship-queries';
import { getShipsByType } from './ship-queries';
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
 * Validates that a fleet is complete according to game rules.
 *
 * Placement-phase validation only.
 * Ensures:
 * - Correct ship counts
 * - No overlapping coordinates
 */
export function validateFleet(
    ships: ShipPlacementInfo[]
): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    // ------------------------------------------------------------
    // Validate expected ship counts
    // ------------------------------------------------------------
    Object.entries(SHIPS_CONFIG).forEach(([shipType, config]) => {
        const shipsOfType = getShipsByType(
            ships,
            shipType as ShipType
        );
        if (shipsOfType.length !== config.count) {
            errors.push(
                `Expected ${config.count} ${config.name}(s), found ${shipsOfType.length}`
            );
        }
    });

    // ------------------------------------------------------------
    // Validate overlapping cells
    // ------------------------------------------------------------
    const occupiedCells = new Set<string>();
    for (const ship of ships) {
        const coordinates = getShipCoordinates(ship);
        for (const coord of coordinates) {
            const key = `${coord.row}-${coord.col}`;
            if (occupiedCells.has(key)) {
                errors.push(
                    `Ship ${ship.type} overlaps another ship`
                );
                break;
            }
            occupiedCells.add(key);
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Checks whether two placed ships overlap.
 */
export function shipsOverlap(
    ship1: ShipPlacementInfo,
    ship2: ShipPlacementInfo
): boolean {
    const occupied = new Set(
        getShipCoordinates(ship1)
            .map(c => `${c.row}-${c.col}`)
    );

    return getShipCoordinates(ship2)
        .some(c => occupied.has(`${c.row}-${c.col}`));
}

/**
 * Validates that ships respect the minimum separation rule (optional)
 */
export function validateShipSeparation(
    ships: ShipPlacementInfo[], 
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
                    ship1: ships[i].type,
                    ship2: ships[j].type,
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
 * Gets all valid placements for a ship on the board
 */
export function getValidPlacements(
    ship: BaseShip,
    boardSize: number = BOARD_SIZE,
    existingShips: ShipPlacementInfo[] = []
): Array<{ position: Position; orientation: Orientation }> {

    const validPlacements: Array<{
        position: Position;
        orientation: Orientation;
    }> = [];

    for (let row = 0; row < boardSize; row++) {

        for (let col = 0; col < boardSize; col++) {

            const position: Position = { row, col };

            for (const orientation of ['horizontal', 'vertical'] as Orientation[]) {

                const intent: PlacementIntent = {
                    ship,
                    position,
                    orientation
                };

                if (
                    canPlaceShipAt(
                        intent,
                        boardSize,
                        existingShips
                    )
                ) {
                    validPlacements.push({
                        position,
                        orientation
                    });
                }
            }
        }
    }

    return validPlacements;
}