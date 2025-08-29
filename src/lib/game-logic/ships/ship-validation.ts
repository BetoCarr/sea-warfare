import { SHIPS_CONFIG, BOARD_SIZE } from '@/lib/utils/constants';
import type { Ship, Position, Orientation, ShipType } from '@/lib/utils/types';
import { getShipCoordinates } from './ship-placement';
import { getDistanceBetweenShips } from './ship-queries';
import { getShipsByType } from './ship-queries';
import { validateShipConfig } from './ship-factory';
import { canPlaceShipAt } from './ship-placement';
/**
 * RESPONSABILIDAD 5: ✅ VALIDACIONES AVANZADAS
 */

/**
 * Valida que una flota esté completa según las reglas del juego
 */
export function validateFleet(ships: Ship[]): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Verificar cantidad correcta de cada tipo de barco
    Object.entries(SHIPS_CONFIG).forEach(([shipType, config]) => {
        const shipsOfType = getShipsByType(ships, shipType as ShipType);
        if (shipsOfType.length !== config.count) {
            errors.push(
                `Se esperaban ${config.count} ${config.name}(s), se encontraron ${shipsOfType.length}`
            );
        }
    });

    // Verificar que todos los barcos estén colocados
    const unplacedShips = ships.filter(ship => !ship.position);
    if (unplacedShips.length > 0) {
        errors.push(`${unplacedShips.length} barco(s) sin colocar`);
    }
    
    // Verificar overlaps
    for (let i = 0; i < ships.length; i++) {
        for (let j = i + 1; j < ships.length; j++) {
            if (shipsOverlap(ships[i], ships[j])) {
                errors.push(`Los barcos ${ships[i].id} y ${ships[j].id} se superponen`);
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Verifica si two barcos se superponen
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
 * Valida que se respete la regla de separación entre barcos (opcional)
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
 * Verifica la integridad de los datos de un barco
 */
export function validateShipIntegrity(ship: Ship): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    
    // Verificar configuración básica
    if (!validateShipConfig(ship)) {
        errors.push('Configuración básica inválida');
    }

    // Verificar coherencia de hits vs isSunk
    const allHitsTrue = ship.hits.every(hit => hit);
    if (ship.isSunk && !allHitsTrue) {
        errors.push('Barco marcado como hundido pero no todos los hits son verdaderos');
    }
    if (!ship.isSunk && allHitsTrue) {
        errors.push('Todos los hits son verdaderos pero el barco no está marcado como hundido');
    }

     // Verificar posición si existe
    if (ship.position) {
        const coordinates = getShipCoordinates(ship);
        if (coordinates.length !== ship.size) {
            errors.push('El número de coordenadas no coincide con el tamaño del barco');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Obtiene posiciones válidas para colocar un barco en el tablero
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
        
            // Probar ambas orientaciones
            for (const orientation of ['horizontal', 'vertical'] as Orientation[]) {
                if (canPlaceShipAt(ship, position, orientation, boardSize, existingShips)) {
                    validPlacements.push({ position, orientation });
                }
            }
        }
    }

    return validPlacements;
}