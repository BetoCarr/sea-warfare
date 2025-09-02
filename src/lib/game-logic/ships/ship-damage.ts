import { getShipCoordinates } from '@/lib/game-logic/ships/ship-placement';
import type { Ship, Position } from '@/lib/utils/types';

/**
 * RESPONSIBILITY 3: DAMAGE AND STATUS MANAGEMENT
 * 
 * This module handles the following responsibilities:
 * 1. Register hits on ships
 * 2. Calculate damage percentage and health status
 * 3. Provide coordinates of hit and intact ship segments
 * 4. Repair ships (reset damage)
 */

/**
 * Registers a hit on a specific position of a ship.
 * - Throws an error if the ship is not placed on the board
 * - Marks the hit in the ship's `hits` array
 * - Updates the `isSunk` flag if all segments are hit
 */
export function hitShipAt(ship: Ship, position: Position): Ship {
    if (!ship.position) {
        throw new Error('Ship must be placed on the board to receive hits');
    }
    
    const coordinates = getShipCoordinates(ship);
    const hitIndex = coordinates.findIndex(
        coord => coord.row === position.row && coord.col === position.col
    );
    
    if (hitIndex === -1) {
        throw new Error('The specified position does not belong to this ship');
    }
    
    const newHits = [...ship.hits];
    newHits[hitIndex] = true;
    
    const newShip: Ship = {
        ...ship,
        hits: newHits,
        isSunk: newHits.every(hit => hit === true)
    };
    
    return newShip;
}

/**
 * Checks if a specific position of a ship has already been hit
 */
export function isShipHitAt(ship: Ship, position: Position): boolean {
    if (!ship.position) return false;
    
    const coordinates = getShipCoordinates(ship);
    const hitIndex = coordinates.findIndex(
        coord => coord.row === position.row && coord.col === position.col
    );
    
    return hitIndex !== -1 && ship.hits[hitIndex];
}

/**
 * Calculates the percentage of damage a ship has taken
 */
export function getShipDamagePercentage(ship: Ship): number {
    const hitsCount = ship.hits.filter(hit => hit).length;
    return (hitsCount / ship.size) * 100;
}

/**
 * Returns a health status label for the ship based on damage
 */
export function getShipHealthStatus(ship: Ship): 'healthy' | 'damaged' | 'critical' | 'sunk' {
    if (ship.isSunk) return 'sunk';
    
    const damagePercent = getShipDamagePercentage(ship);
    
    if (damagePercent === 0) return 'healthy';
    if (damagePercent < 75) return 'damaged';
    return 'critical';
}

/**
 * Resets the damage state of a ship
 * - All hits are cleared
 * - `isSunk` is set to false
 */
export function repairShip(ship: Ship): Ship {
    return {
        ...ship,
        hits: new Array(ship.size).fill(false),
        isSunk: false
    };
}

/**
 * Returns an array of coordinates that have not been hit yet
 */
export function getIntactCoordinates(ship: Ship): Position[] {
    if (!ship.position) return [];

    const allCoordinates = getShipCoordinates(ship);
    return allCoordinates.filter((coord, index) => !ship.hits[index]);
}

/**
 * Returns an array of coordinates that have been hit
 */
export function getHitCoordinates(ship: Ship): Position[] {
    if (!ship.position) return [];
    
    const allCoordinates = getShipCoordinates(ship);
    return allCoordinates.filter((coord, index) => ship.hits[index]);
}