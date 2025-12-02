import type { Ship, ShipType } from '@/lib/utils/types';
import { SHIPS_CONFIG } from '@/lib/utils/constants';

/**
 * RESPONSIBILITY 1: CREATION AND CONFIGURATION
 * 
 * This module handles the following responsibilities:
 * 1. Create new ships with default properties
 * 2. Generate a full fleet for a player
 * 3. Generate unique ship IDs
 * 4. Validate ship configuration
 * 5. Clone ships for immutability
 */

/**
 * Creates a new ship with initial properties.
 * - Sets default orientation to 'horizontal'
 * - Initializes the hits array based on ship size
 * - Marks `isSunk` as false
 * - Position is initially undefined
 */
export function createShip(
    type: ShipType, 
    id?: string
): Ship {
    const config = SHIPS_CONFIG[type];
    
    if (!config) {
        throw new Error(`Invalid ship type: ${type}`);
    }

    return {
        id: id || generateShipId(type),
        type,
        size: config.size,
        position: undefined, // No initial position
        orientation: 'horizontal',
        hits: new Array(config.size).fill(false),
        isSunk: false
    };
}

/**
 * Creates a full fleet of ships for a player.
 * - Iterates over SHIPS_CONFIG
 * - Handles multiple ships of the same type (e.g., multiple submarines)
 */
export function createFleet(): Ship[] {
    const fleet: Ship[] = [];

    Object.entries(SHIPS_CONFIG).forEach(([shipType, config]) => {
        for (let i = 0; i < config.count; i++) {
            const id = config.count > 1 ? `${shipType}-${i + 1}` : shipType;
            fleet.push(createShip(shipType as ShipType, id));
        }
    });

    return fleet;
}

/**
 * Generates a unique ID for a ship.
 * - Combines ship type, timestamp, and random string
 * - Useful for React keys and internal tracking
 */
function generateShipId(type: ShipType): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `${type}-${timestamp}-${random}`;
}

/**
 * Validates a ship's configuration
 * - Checks size matches SHIPS_CONFIG
 * - Ensures hits array length matches ship size
 * - Validates orientation
 */
export function validateShipConfig(ship: Ship): boolean {
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
 * - Copies position if it exists
 */
export function cloneShip(ship: Ship): Ship {
    return {
        ...ship,
        hits: [...ship.hits],
        position: ship.position ? { ...ship.position } : undefined
    };
}