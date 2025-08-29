import type { Ship, ShipType } from '@/lib/utils/types';
import { SHIPS_CONFIG } from '@/lib/utils/constants';

/**
 * RESPONSABILIDAD 1: 🏗️ CREACIÓN Y CONFIGURACIÓN
 */

/**
 * Crea un nuevo barco con propiedades iniciales
 */
export function createShip(
    type: ShipType, 
    id?: string
): Ship {
    const config = SHIPS_CONFIG[type];
    
    if (!config) {
        throw new Error(`Tipo de barco inválido: ${type}`);
    }

    return {
        id: id || generateShipId(type),
        type,
        size: config.size,
        position: undefined, // Sin posición inicial
        orientation: 'horizontal',
        hits: new Array(config.size).fill(false),
        isSunk: false
    };
}

/**
 * Crea un conjunto completo de barcos para un jugador
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
 * Genera un ID único para un barco
 */
function generateShipId(type: ShipType): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `${type}-${timestamp}-${random}`;
}

/**
 * Valida la configuración de un barco
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
 * Clona un barco (útil para inmutabilidad)
 */
export function cloneShip(ship: Ship): Ship {
    return {
        ...ship,
        hits: [...ship.hits],
        position: ship.position ? { ...ship.position } : undefined
    };
}