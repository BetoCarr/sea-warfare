import type { Ship, ShipPlacementInfo } from '@/lib/utils/types';
import { SHIPS_CONFIG } from '@/lib/utils/constants';

/**
 * RESPONSIBILITY: COMBAT ENTITY CONSTRUCTION AND MANAGEMENT
 * 
 * This module is responsible for:
 * 1. Creating full playable Ship entities from placement info
 * 2. Validating full combat entity state
 * 3. Cloning ship entities for immutability
 */

/**
 * Creates a full playable Ship entity from placement information.
 * - Copies all placement structure and spatial context
 * - Initializes combat state: hits array and isSunk status
 */
export function createShipFromPlacement(placement: ShipPlacementInfo): Ship {
    return {
        ...placement,
        hits: new Array(placement.size).fill(false),
        isSunk: false
    };
}

/**
 * Validates a full ship's configuration and state
 * - Ensures hits array length matches ship size
 * - Validates orientation is allowed
 * - Assumes structural integrity size match was done or implicitly config valid
 */
export function validateShip(ship: Ship): boolean {
    // Structural check could also be added, but here explicitly checking entity shape
    const config = SHIPS_CONFIG[ship.type];
    
    return (
        ship.size === config.size &&
        ship.hits.length === ship.size &&
        ['horizontal', 'vertical'].includes(ship.orientation)
    );
}

/**
 * Clones a ship object to maintain immutability.
 * - Copies the hits array
 * - Copies position if it exists (using spread since position is an object)
 */
export function cloneShip(ship: Ship): Ship {
    return {
        ...ship,
        hits: [...ship.hits],
        position: { ...ship.position }
    };
}
