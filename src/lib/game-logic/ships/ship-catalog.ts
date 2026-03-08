import type { BaseShip, ShipType } from '@/lib/utils/types';
import { SHIPS_CONFIG } from '@/lib/utils/constants';

/**
 * RESPONSIBILITY 1: SHIP CATALOG AND STRUCTURAL DEFINITIONS
 * 
 * This module handles:
 * 1. Creating base structural representations of ships (BaseShip)
 * 2. Generating a full fleet of structural ships for a player
 * 3. Generating unique ship IDs
 */

/**
 * Generates a unique ID for a ship.
 * - Combines ship type, timestamp, and random string
 * - Useful for React keys and internal tracking
 */
export function generateShipId(type: ShipType): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `${type}-${timestamp}-${random}`;
}

/**
 * Creates a base structural representation of a ship.
 * - Uses SHIPS_CONFIG to determine size
 * - Returns only structural properties: id, type, size
 * - Does NOT include grid positioning, orientation, or combat state
 */
export function createBaseShip(type: ShipType, id?: string): BaseShip {
    const config = SHIPS_CONFIG[type];
    
    if (!config) {
        throw new Error(`Invalid ship type: ${type}`);
    }

    return {
        id: id || generateShipId(type),
        type,
        size: config.size
    };
}

/**
 * Creates a full fleet of base structural ships for a player.
 * - Iterates over SHIPS_CONFIG
 * - Handles multiple ships of the same type (e.g., multiple submarines)
 * - Returns only structural ships without orientation or combat state
 */
export function createFleet(): BaseShip[] {
    const fleet: BaseShip[] = [];

    Object.entries(SHIPS_CONFIG).forEach(([shipType, config]) => {
        for (let i = 0; i < config.count; i++) {
            const id = config.count > 1 ? `${shipType}-${i + 1}` : shipType;
            fleet.push(createBaseShip(shipType as ShipType, id));
        }
    });

    return fleet;
}

/**
 * Validates a base ship's structural configuration
 * - Checks size matches SHIPS_CONFIG
 */
export function validateBaseShip(ship: BaseShip): boolean {
    const config = SHIPS_CONFIG[ship.type];
    return ship.size === config.size;
}

export function getBaseShipByType(type: ShipType): BaseShip {
    const config = SHIPS_CONFIG[type];

    if (!config) {
        throw new Error(`Invalid ship type: ${type}`);
    }

    return {
        id: type,
        type,
        size: config.size
    };
}