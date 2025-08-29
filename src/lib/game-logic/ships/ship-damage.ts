import { getShipCoordinates } from '@/lib/game-logic/ships/ship-placement';
import type { Ship, Position } from '@/lib/utils/types';

/**
 * RESPONSABILIDAD 3: 💥 MANEJO DE DAÑO Y ESTADO
 */

/**
 * Registra un hit en una posición específica del barco
 */
export function hitShipAt(ship: Ship, position: Position): Ship {
    if (!ship.position) {
        throw new Error('El barco debe estar colocado en el tablero para recibir hits');
    }
    
    const coordinates = getShipCoordinates(ship);
    const hitIndex = coordinates.findIndex(
        coord => coord.row === position.row && coord.col === position.col
    );
    
    if (hitIndex === -1) {
        throw new Error('La posición no corresponde a este barco');
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
 * Verifica si una coordenada específica del barco ya fue impactada
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
 * Calcula el porcentaje de daño del barco
 */
export function getShipDamagePercentage(ship: Ship): number {
    const hitsCount = ship.hits.filter(hit => hit).length;
    return (hitsCount / ship.size) * 100;
}

/**
 * Obtiene el estado de salud del barco
 */
export function getShipHealthStatus(ship: Ship): 'healthy' | 'damaged' | 'critical' | 'sunk' {
    if (ship.isSunk) return 'sunk';
    
    const damagePercent = getShipDamagePercentage(ship);
    
    if (damagePercent === 0) return 'healthy';
    if (damagePercent < 75) return 'damaged';
    return 'critical';
}
/**
 * Resetea el estado de daño de un barco
 */
export function repairShip(ship: Ship): Ship {
    return {
        ...ship,
        hits: new Array(ship.size).fill(false),
        isSunk: false
    };
}
/**
 * Obtiene las coordenadas que aún no han sido impactadas
 */
export function getIntactCoordinates(ship: Ship): Position[] {
    if (!ship.position) return [];

    const allCoordinates = getShipCoordinates(ship);
    return allCoordinates.filter((coord, index) => !ship.hits[index]);
}

/**
 * Obtiene las coordenadas que han sido impactadas
 */
export function getHitCoordinates(ship: Ship): Position[] {
    if (!ship.position) return [];
    
    const allCoordinates = getShipCoordinates(ship);
    return allCoordinates.filter((coord, index) => ship.hits[index]);
}