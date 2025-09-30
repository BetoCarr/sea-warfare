import type { Position, Ship } from '@/lib/utils/types';
import { createBoardState, BoardState, wasPositionAttacked } from './board-sync';
import { BOARD_SIZE } from '@/lib/utils/constants';
import { isPositionInBounds } from './board-factory';
import { hitShipAt } from '../ships/ship-damage';
import { findShipAtPosition } from '../ships/ship-queries';

/**
 * Result of a single attack
 */
export interface AttackResult {
    position: Position;
    type: 'hit' | 'miss' | 'sunk' | 'invalid'; 
    impactedShip?: Ship;
    originalShip?: Ship;
    error?: string; // Extra details in case of invalid attack
}

/**
 * Game state after processing an attack
 */
export interface GameAttackState {
    boardState: BoardState;
    attackResult: AttackResult;
    isGameOver: boolean;
    winner?: 'player' | 'ai';            
}

/**
 * Rules for validating attacks
 */
export interface AttackValidation {
    allowDuplicateAttacks: boolean;       // Permitir atacar la misma posición
    requireInBounds: boolean;
}

/**
 * Default validation rules
 */
export const DEFAULT_ATTACK_VALIDATION: AttackValidation = {
    allowDuplicateAttacks: false,
    requireInBounds: true
};

/**
 * Checks if an attack is valid according to the given rules
 * @param boardState - Current board state
 * @param attackPosition - Position being attacked
 * @param validation - Validation rules
 * @returns true if the attack is valid
 */
export function isValidAttack(
    boardState: BoardState,
    attackPosition: Position,
    validation: AttackValidation = DEFAULT_ATTACK_VALIDATION
): boolean {
    if (validation.requireInBounds && !isPositionInBounds(attackPosition, BOARD_SIZE)) {
        return false;
    }

    if (!validation.allowDuplicateAttacks && wasPositionAttacked(boardState, attackPosition)) {
        return false;
    }

    return true;
}

/**
 * Returns an error message if an attack is invalid
 * @param boardState - Current board state
 * @param attackPosition - Position being attacked
 * @param validation - Validation rules
 * @returns Error message or null if valid
 */
export function getAttackValidationError(
    boardState: BoardState,
    attackPosition: Position,
    validation: AttackValidation = DEFAULT_ATTACK_VALIDATION
): string | null {
    if (validation.requireInBounds && !isPositionInBounds(attackPosition, BOARD_SIZE)) {
        return `Position (${attackPosition.row}, ${attackPosition.col}) is outside the board (size: ${BOARD_SIZE})`;
    }

    if (!validation.allowDuplicateAttacks && wasPositionAttacked(boardState, attackPosition)) {
        return `Position (${attackPosition.row}, ${attackPosition.col}) was already attacked`;
    }

    return null;
}

/**
 * Determines the outcome of an attack (hit, miss, sunk)
 * @param ships - List of ships on the board
 * @param attackPosition - Position being attacked
 * @returns Detailed attack result
 */
export function determineAttackResult(
    ships: Ship[],
    attackPosition: Position
): AttackResult {
    const targetShip = findShipAtPosition(ships, attackPosition);

    if (!targetShip) {
        return { position: attackPosition, type: 'miss' };
    }

    const updatedShip = hitShipAt(targetShip, attackPosition);

    const baseResult = {
        position: attackPosition,
        originalShip: targetShip,
        impactedShip: updatedShip,     
    };

    return updatedShip.isSunk 
        ? { ...baseResult, type: 'sunk' as const }
        : { ...baseResult, type: 'hit' as const };
}

/**
 * Processes an attack:
 * validates → resolves result → updates board → checks game over
 * @param currentBoardState - Current board state
 * @param attackPosition - Position being attacked
 * @param validation - Validation rules
 * @returns Updated game state after the attack
 */
export function processAttack(
    currentBoardState: BoardState,
    attackPosition: Position,
    validation: AttackValidation = DEFAULT_ATTACK_VALIDATION
): GameAttackState {
    // PASO 1: Validar el ataque
    const validationError = getAttackValidationError(currentBoardState, attackPosition, validation);

    if (validationError) {
        return {
            boardState: currentBoardState, 
            attackResult: { 
                position: attackPosition, 
                type: 'invalid',          
                error: validationError 
            },
            isGameOver: false,
        };
    }

    const attackResult = determineAttackResult(currentBoardState.ships, attackPosition);

    let updatedShips = currentBoardState.ships;

    if (attackResult.impactedShip) {
        updatedShips = currentBoardState.ships.map(ship => 
            ship.id === attackResult.impactedShip!.id ? attackResult.impactedShip! : ship
        );
    }   

    const newAttacks = [...currentBoardState.attacks, attackResult.position];
    const newBoardState = createBoardState(updatedShips, newAttacks);
    const isGameOver = checkGameOver(updatedShips);

    return {
        boardState: newBoardState,
        attackResult,
        isGameOver,
        winner: isGameOver ? 'player' : undefined 
    };
}


/**
 * Checks if all ships are sunk
 * @param ships - List of ships
 * @returns true if all ships are sunk
 */
export function checkGameOver(ships: Ship[]): boolean {
    return ships.length > 0 && ships.every(ship => ship.isSunk);
}

