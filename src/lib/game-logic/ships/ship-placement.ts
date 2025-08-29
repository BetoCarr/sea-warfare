import type { Ship, Position, Orientation } from '@/lib/utils/types';
import { BOARD_SIZE } from '@/lib/utils/constants';
/**
 * RESPONSABILIDAD 2: 📍 GESTIÓN DE POSICIÓN Y COLOCACIÓN
 */

/**
 * Obtiene todas las coordenadas que ocupa un barco
 */
export function getShipCoordinates(ship: Ship): Position[] {
    if (!ship.position) return [];
    
    const coordinates: Position[] = [];
    const { row, col } = ship.position;

    for (let i = 0; i < ship.size; i++) {
        if (ship.orientation === 'horizontal') {
            coordinates.push({ row, col: col + i });
        } else {
            coordinates.push({ row: row + i, col });
        }
    }

    return coordinates;
}
/**
 * Verifica si un barco puede colocarse en una posición específica
 */
export function canPlaceShipAt(
    ship: Ship,
    position: Position,
    orientation: Orientation,
    boardSize: number = BOARD_SIZE,
    existingShips: Ship[] = []
): boolean {
    // Crear barco temporal para validación
    const tempShip: Ship = {
        ...ship,
        position,
        orientation
    };

    const coordinates = getShipCoordinates(tempShip);

    // Verificar límites del tablero
    for (const coord of coordinates) {
        if (coord.row < 0 || coord.row >= boardSize ||
            coord.col < 0 || coord.col >= boardSize) {
            return false;
        }
    }

    // Verificar overlaps con otros barcos
    for (const existingShip of existingShips) {
        if (existingShip.id === ship.id) continue; // Skip mismo barco
        
        const existingCoords = getShipCoordinates(existingShip);
        for (const coord of coordinates) {
            for (const existingCoord of existingCoords) {
                if (coord.row === existingCoord.row && coord.col === existingCoord.col) {
                    return false;
                }
            }
        }
    }
    
    return true;
}
/**
 * Coloca un barco en una posición específica
 */
export function placeShip(
    ship: Ship,
    position: Position,
    orientation: Orientation,
    boardSize: number = BOARD_SIZE,
    existingShips: Ship[] = []
): Ship {
    if (!canPlaceShipAt(ship, position, orientation, boardSize, existingShips)) {
        throw new Error(`No se puede colocar ${ship.type} en la posición especificada`);
    }

    return {
        ...ship,
        position: { ...position },
        orientation
    };
}
/**
 * Cambia la orientación de un barco
 */
export function rotateShip(
    ship: Ship,
    boardSize: number = BOARD_SIZE,
    existingShips: Ship[] = []
): Ship {
    if (!ship.position) {
        // Si no tiene posición, solo cambiar orientación
        return {
            ...ship,
            orientation: ship.orientation === 'horizontal' ? 'vertical' : 'horizontal'
        };
    }

    const newOrientation: Orientation = 
        ship.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    
    if (canPlaceShipAt(ship, ship.position, newOrientation, boardSize, existingShips)) {
        return {
            ...ship,
            orientation: newOrientation
        };
    }
    
    // Si no se puede rotar en la posición actual, mantener orientación
    return ship;
}

/**
 * Remueve un barco del tablero (quita su posición)
 */
export function removeShipFromBoard(ship: Ship): Ship {
    return {
        ...ship,
        position: undefined
    };
}