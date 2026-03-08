import { SHIPS_CONFIG } from '@/lib/utils/constants';;
import { Position, Ship, ShipType, ShipPlacementInfo, BaseShip } from '@/lib/utils/types';
import { getShipCoordinates } from './ship-placement';
import { getShipHealthStatus, getShipDamagePercentage } from './ship-damage';
import { validateShip } from './ship-entity';
/**
 * RESPONSIBILITY 4: QUERIES AND UTILITIES
 * 
 * This module handles:
 * 1. Checking if a coordinate belongs to a ship
 * 2. Finding ships at specific positions
 * 3. Calculating distances between ships
 * 4. Filtering and grouping ships by type or status
 * 5. Gathering fleet statistics
 * 6. Serializing and deserializing ships for persistence
 * 7. Generating ship summaries with metadata and health info
 */

/**
 * Checks whether a coordinate belongs to a specific ship
 */
export function isCoordinateInShip(ship: ShipPlacementInfo, position: Position): boolean {
    if (!ship.position) return false;
    
    const coordinates = getShipCoordinates(ship);
    return coordinates.some(coord => 
        coord.row === position.row && coord.col === position.col
    );
}

/**
 * Finds a ship located at a specific position within a fleet
 */
export function findShipAtPosition<T extends ShipPlacementInfo>(ships: T[], position: Position): T | undefined {
    return ships.find(ship => isCoordinateInShip(ship, position));
}

/**
 * Calculates the minimum Euclidean distance between two ships
 */
export function getDistanceBetweenShips(ship1: ShipPlacementInfo, ship2: ShipPlacementInfo): number {
    if (!ship1.position || !ship2.position) return Infinity;
    
    const coords1 = getShipCoordinates(ship1);
    const coords2 = getShipCoordinates(ship2);
    
    let minDistance = Infinity;

    for (const coord1 of coords1) {
        for (const coord2 of coords2) {
            const distance = Math.sqrt(
                Math.pow(coord1.row - coord2.row, 2) + 
                Math.pow(coord1.col - coord2.col, 2)
            );
            minDistance = Math.min(minDistance, distance);
        }
    }

    return minDistance;
}

/**
 * Returns all ships of a specific type
 */
export function getShipsByType<T extends BaseShip>(ships: T[], type: ShipType): T[] {
    return ships.filter(ship => ship.type === type);
}

/**
 * Checks if a fleet contains at least one ship of the specified type
 */
export function hasShipOfType(
    ships: ShipPlacementInfo[],
    type: ShipType
): boolean {
    return ships.some(ship => ship.type === type);
}

/**
 * Returns an array of ship types that have been placed on the board
 */
export function getPlacedShipTypes(
    ships: ShipPlacementInfo[]
): ShipType[] {
    return ships.map(ship => ship.type);
}

/**
 * Collects fleet statistics by ship state and placement
 */
export function getFleetStats(ships: Ship[]) {
    return {
        total: ships.length,
        placed: ships.filter(ship => ship.position !== undefined).length,
        healthy: ships.filter(ship => getShipHealthStatus(ship) === 'healthy').length,
        damaged: ships.filter(ship => getShipHealthStatus(ship) === 'damaged').length,
        critical: ships.filter(ship => getShipHealthStatus(ship) === 'critical').length,
        sunk: ships.filter(ship => ship.isSunk).length,
        active: ships.filter(ship => !ship.isSunk).length
    };
}

/**
 * Serializes a ship into a JSON string for persistence
 */
export function serializeShip(ship: Ship): string {
    return JSON.stringify(ship);
}

/**
 * Deserializes a ship from JSON
 * - Validates configuration integrity
 */
export function deserializeShip(shipData: string): Ship {
    const parsed = JSON.parse(shipData);
    
    if (!validateShip(parsed)) {
        throw new Error('Invalid ship data');
    }

    return parsed;
}

/**
 * Generates a summarized view of a ship
 * - Includes metadata, placement info, and health state
 */
export function getShipSummary(ship: Ship) {
    const config = SHIPS_CONFIG[ship.type];

    return {
        id: ship.id,
        name: config.name,
        type: ship.type,
        size: ship.size,
        isPlaced: !!ship.position,
        position: ship.position,
        orientation: ship.orientation,
        healthStatus: getShipHealthStatus(ship),
        damagePercent: getShipDamagePercentage(ship),
        hitsReceived: ship.hits.filter(hit => hit).length,
        coordinates: getShipCoordinates(ship)
    };
}