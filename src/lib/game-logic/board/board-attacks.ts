import type { Position, Ship } from '@/lib/utils/types';
import { createBoardState, BoardState, wasPositionAttacked } from './board-sync';
import { BOARD_SIZE } from '@/lib/utils/constants';
import { isPositionInBounds } from './board-factory';
import { getShipCoordinates } from '@/lib/game-logic/ships/ship-placement';
import { hitShipAt } from '../ships/ship-damage';
import { findShipAtPosition } from '../ships/ship-queries';

/**
 * Attack outcome at a specific position
 */
export interface AttackResult {
    position: Position;
    type: 'hit' | 'miss' | 'sunk' | 'invalid'; 
    hitShip?: Ship;
    sunkShip?: Ship;
    newShipState?: Ship;
    error?: string;  // ← NUEVO: Para detalles del error en ataques inválidos
}

/**
 * Full state returned after processing an attack
 */
export interface GameAttackState {
    boardState: BoardState;
    attackResult: AttackResult;
    isGameOver: boolean;
    winner?: 'player' | 'ai';            // Ganador (si aplica)
}

/**
 * Rules for validating attacks
 */
export interface AttackValidation {
    allowDuplicateAttacks: boolean;       // Permitir atacar la misma posición
    requireInBounds: boolean;
}

// ============================================================================
// PASO 2: VALIDACIÓN DE ATAQUES
// ============================================================================

// Configuración por defecto para ataques
export const DEFAULT_ATTACK_VALIDATION: AttackValidation = {
    allowDuplicateAttacks: false,
    requireInBounds: true
};

/**
 * Valida si un ataque es permitido según las reglas del juego
 * @param boardState - Estado actual del tablero
 * @param attackPosition - Posición a atacar
 * @param validation - Reglas de validación
 * @returns true si el ataque es válido
 */
export function isValidAttack(
    boardState: BoardState,
    attackPosition: Position,
    validation: AttackValidation = DEFAULT_ATTACK_VALIDATION
): boolean {
     // Check board bounds
    if (validation.requireInBounds && !isPositionInBounds(attackPosition, BOARD_SIZE)) {
        return false;
    }

    // Verificar ataques duplicados
    if (!validation.allowDuplicateAttacks && wasPositionAttacked(boardState, attackPosition)) {
        return false;
    }

    return true;
}

/**
 * Obtiene un mensaje de error específico para ataques inválidos
 * @param boardState - Estado actual del tablero
 * @param attackPosition - Posición a atacar
 * @param validation - Reglas de validación
 * @returns Mensaje de error o null si es válido
 */
export function getAttackValidationError(
    boardState: BoardState,
    attackPosition: Position,
    validation: AttackValidation = DEFAULT_ATTACK_VALIDATION
): string | null {
    // Bounds validation
    if (validation.requireInBounds && !isPositionInBounds(attackPosition, BOARD_SIZE)) {
        return `Position (${attackPosition.row}, ${attackPosition.col}) is outside the board (size: ${BOARD_SIZE})`;
    }

    // Duplicate validation
    if (!validation.allowDuplicateAttacks && wasPositionAttacked(boardState, attackPosition)) {
        return `Position (${attackPosition.row}, ${attackPosition.col}) was already attacked`;
    }

    return null;
}


// ============================================================================
// PASO 3: LÓGICA CENTRAL - DETERMINAR RESULTADO DEL ATAQUE
// ============================================================================

/**
 * Determina el resultado de un ataque basándose en la posición y los barcos
 * Esta es la función CORE - convierte posición → resultado del ataque
 * @param ships - Array de barcos en el tablero
 * @param attackPosition - Posición del ataque
 * @returns Resultado detallado del ataque
 */
export function determineAttackResult(
    ships: Ship[],
    attackPosition: Position
): AttackResult {
    const targetShip = findShipAtPosition(ships, attackPosition);

    if (!targetShip) {
        return { position: attackPosition, type: 'miss' };
    }

        // 2. Aplicar el daño al barco
    const updatedShip = hitShipAt(targetShip, attackPosition);

    // 3. Determinar resultado
    if (updatedShip.isSunk) {
        return {
            position: attackPosition,
            type: 'sunk',
            hitShip: targetShip,
            sunkShip: updatedShip,
            newShipState: updatedShip,
        };
    }

    return {
        position: attackPosition,
        type: 'hit',
        hitShip: targetShip,
        newShipState: updatedShip,
    };
}

// ============================================================================
// PASO 4: FUNCIÓN PRINCIPAL - PROCESAR ATAQUE COMPLETO
// ============================================================================
/**
 * Procesa un ataque completo: validación + resultado + actualización de estado
 * Esta es la función principal que usarás en tu juego
 * @param currentBoardState - Estado actual del tablero
 * @param attackPosition - Posición a atacar
 * @param validation - Reglas de validación
 * @returns Estado completo del juego después del ataque
 */
export function processAttack(
    currentBoardState: BoardState,
    attackPosition: Position,
    validation: AttackValidation = DEFAULT_ATTACK_VALIDATION
): GameAttackState {
    // PASO 1: Validar el ataque
    const validationError = getAttackValidationError(
        currentBoardState, 
        attackPosition, 
        validation
    );

    if (validationError) {
        return {
            boardState: currentBoardState,  // No cambiar estado si hay error
            attackResult: { 
                position: attackPosition, 
                type: 'invalid',           // ← MÁS CLARO: 'invalid' no 'miss'
                error: validationError     // ← DETALLE DEL ERROR
            },
            isGameOver: false,
        };
    }

    // PASO 2: Determinar resultado del ataque
    const attackResult = determineAttackResult(
        currentBoardState.ships, 
        attackPosition
    );

    // PASO 3: Actualizar array de barcos (si hubo impacto)
    let updatedShips = currentBoardState.ships;
    if (attackResult.type === 'hit' || attackResult.type === 'sunk') {
        updatedShips = currentBoardState.ships.map(ship => 
            ship.id === attackResult.newShipState!.id ? attackResult.newShipState! : ship
        );
    }

    // PASO 4: Añadir el ataque a la lista de ataques
    const newAttacks = [...currentBoardState.attacks, attackResult.position];

    // PASO 5: Regenerar board state completo
    const newBoardState = createBoardState(updatedShips, newAttacks);

    // PASO 6: Verificar si el juego terminó
    const isGameOver = checkGameOver(updatedShips);

    return {
        boardState: newBoardState,
        attackResult,
        isGameOver,
        winner: isGameOver ? 'player' : undefined // Por ahora solo player vs AI
    };
}

// ============================================================================
// PASO 5: FUNCIONES AUXILIARES - GAME OVER Y UTILIDADES
// ============================================================================

/**
 * Verifica si el juego ha terminado (todos los barcos hundidos)
 * @param ships - Array de barcos a verificar
 * @returns true si todos los barcos están hundidos
 */
export function checkGameOver(ships: Ship[]): boolean {
    return ships.length > 0 && ships.every(ship => ship.isSunk);
}

// /**
//  * Obtiene estadísticas de la flota para UI/debugging
//  * @param ships - Array de barcos
//  * @returns Estadísticas detalladas
//  */
// export function getFleetStats(ships: Ship[]): {
//     total: number;
//     sunk: number;
//     remaining: number;
//     hitPoints: number;
//     totalHitPoints: number;
// } {
//     const total = ships.length;
//     const sunk = ships.filter(ship => ship.isSunk).length;
//     const remaining = total - sunk;
    
//     const hitPoints = ships.reduce((sum, ship) => 
//         sum + ship.damage.filter(hit => hit).length, 0
//     );

//     const totalHitPoints = ships.reduce((sum, ship) => 
//         sum + ship.size, 0
//     );

//     return { total, sunk, remaining, hitPoints, totalHitPoints };
// }

// /**
//  * Encuentra todos los barcos en una posición específica
//  * @param ships - Array de barcos
//  * @param position - Posición a verificar
//  * @returns Array de barcos en esa posición (normalmente 0 o 1)
//  */
// export function findShipsAtPosition(ships: Ship[], position: Position): Ship[] {
//     return ships.filter(ship => {
//         const coordinates = getShipCoordinates(ship);
//         return coordinates.some(pos => 
//             pos.row === position.row && pos.col === position.col
//         );
//     });
// }

// /**
//  * Obtiene todas las posiciones disponibles para atacar
//  * @param boardState - Estado actual del tablero
//  * @returns Array de posiciones que no han sido atacadas
//  */
// export function getAvailableAttackPositions(boardState: BoardState): Position[] {
//     const available: Position[] = [];
//     const { rows, cols } = boardState.dimensions;

//     for (let row = 0; row < rows; row++) {
//         for (let col = 0; col < cols; col++) {
//             const position: Position = { row, col };
//             if (!wasPositionAttacked(boardState, position)) {
//                 available.push(position);
//             }
//         }
//     }

//     return available;
// }