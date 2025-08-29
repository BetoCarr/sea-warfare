import { SHIPS_CONFIG } from '@/lib/utils/constants';;
import { Position, Ship, ShipType } from '@/lib/utils/types';
import { getShipCoordinates } from './ship-placement';
import { getShipHealthStatus, getShipDamagePercentage } from './ship-damage';
import { validateShipConfig } from './ship-factory';

/**
 * RESPONSABILIDAD 4: 🔍 CONSULTAS Y UTILIDADES
 */

/**
 * Verifica si una coordenada pertenece a un barco
 */
export function isCoordinateInShip(ship: Ship, position: Position): boolean {
    if (!ship.position) return false;
    
    const coordinates = getShipCoordinates(ship);
    return coordinates.some(coord => 
        coord.row === position.row && coord.col === position.col
    );
}

/**
 * Encuentra un barco en una posición específica dentro de una flota
 */
export function findShipAtPosition(ships: Ship[], position: Position): Ship | undefined {
    return ships.find(ship => isCoordinateInShip(ship, position));
}

/**
 * Calcula la distancia mínima entre dos barcos
 */
export function getDistanceBetweenShips(ship1: Ship, ship2: Ship): number {
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
 * Obtiene todos los barcos de un tipo específico
 */
export function getShipsByType(ships: Ship[], type: ShipType): Ship[] {
    return ships.filter(ship => ship.type === type);
}

/**
 * Cuenta barcos por estado
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
 * Serializa un barco para persistencia (JSON)
 */
export function serializeShip(ship: Ship): string {
    return JSON.stringify(ship);
}

/**
 * Deserializa un barco desde JSON
 */
export function deserializeShip(shipData: string): Ship {
    const parsed = JSON.parse(shipData);
    
    // Validar estructura
    if (!validateShipConfig(parsed)) {
        throw new Error('Datos de barco inválidos');
    }

    return parsed;
}

/**
 * Obtiene información resumida de un barco
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