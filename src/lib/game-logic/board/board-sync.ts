import type { CellState, Ship, Position } from '@/lib/utils/types';
import { BOARD_SIZE } from '@/lib/utils/constants';
import { getShipCoordinates } from '@/lib/game-logic/ships/ship-placement';
import { createEmptyBoard, isPositionInBounds } from './board-factory';

/**
 * RESPONSIBILITY: 🔗 BOARD SYNCHRONIZATION (ships ↔ board)
 *
 * This module provides utilities to:
 * - Derive a render-ready board (CellState[][]) from ships + attacks
 * - Maintain consistency between source of truth (ships) and derived view (board)
 * - Build complete BoardState snapshots with helpful metadata
 */

export interface BoardState {
    board: CellState[][];
    ships: Ship[];
    attacks: Position[]; // chronological attack history
    hits: Position[];    // successful attacks
    misses: Position[];  // failed attacksmisses: Position[];  // Posiciones que resultaron en miss
}

/**
 * Generate a board matrix from ships + attacks.
 *
 * 1) Build a map of all ship coordinates for O(1) lookups.
 * 2) Process each attack:
 *    - If it hits a ship, mark 'hit' or 'sunk' depending on ship.hits/isSunk.
 *    - If no ship, mark 'miss'.
 * 3) Mark untouched ship segments as 'ship'.
 *
 * Note: `ship.hits` is considered the authority for hit status.
 */
export function syncBoardFromShips(
    ships: Ship[], 
    attacks: Position[] = [], 
    size: number = BOARD_SIZE
): CellState[][] {
    const board = createEmptyBoard(size);
    
    const shipCoordinatesMap = new Map<string, { ship: Ship; segmentIndex: number }>();
    
    ships.forEach(ship => {
        if (!ship.position) return;
        
        const coordinates = getShipCoordinates(ship);
        coordinates.forEach((pos, segmentIndex) => {
            const key = `${pos.row},${pos.col}`;
            shipCoordinatesMap.set(key, { ship, segmentIndex });
        });
    });

    attacks.forEach(attackPos => {
        if (!isPositionInBounds(attackPos, size)) return;
        
        const key = `${attackPos.row},${attackPos.col}`;
        const shipInfo = shipCoordinatesMap.get(key);
        
        if (shipInfo) {
            // Ship found at this position
            const { ship, segmentIndex } = shipInfo;
            const isSegmentHit = ship.hits[segmentIndex];
        
        if (isSegmentHit) {
            // Correctly marked as 'hit' or 'sunk'
            board[attackPos.row][attackPos.col] = ship.isSunk ? 'sunk' : 'hit';
        } else {
            // Should not happen if ship logic is consistent
            board[attackPos.row][attackPos.col] = 'ship';
        }
        } else {
            // Empty cell → mark as 'miss'
            board[attackPos.row][attackPos.col] = 'miss';
        }
    });

    ships.forEach(ship => {
        if (!ship.position) return;
        
        const coordinates = getShipCoordinates(ship);
        coordinates.forEach((pos, segmentIndex) => {
            if (!isPositionInBounds(pos, size)) return;
            
            const wasAttacked = attacks.some(attack => 
                attack.row === pos.row && attack.col === pos.col
            );
            
            if (!wasAttacked) {
                board[pos.row][pos.col] = 'ship';
            }
        });
    });

    return board;
}

/**
 * Build a full BoardState snapshot (board + metadata).
 * Includes categorized hits and misses for convenience.
 */
export function createBoardState(
    ships: Ship[], 
    attacks: Position[] = [], 
    size: number = BOARD_SIZE
): BoardState {
    const board = syncBoardFromShips(ships, attacks, size);

    const hits: Position[] = [];
    const misses: Position[] = [];

    attacks.forEach(pos => {
        if (!isPositionInBounds(pos, size)) return;
        
        const cellState = board[pos.row][pos.col];
        if (cellState === 'hit' || cellState === 'sunk') {
            hits.push(pos);
        } else if (cellState === 'miss') {
            misses.push(pos);
        }
    });

    return {
        board,
        ships,
        attacks,
        hits,
        misses
    };
}

/**
 * Add a new attack immutably and regenerate the BoardState.
 * Duplicate attacks are ignored.
 *
 * Important: does NOT update ships.hits — caller must update ships first.
 */
export function updateBoardWithAttack(
    currentState: BoardState, 
    attackPosition: Position
): BoardState {
    // Check if the attack is a duplicate
    const isDuplicateAttack = currentState.attacks.some(
        attack => attack.row === attackPosition.row && attack.col === attackPosition.col
    );

    if (isDuplicateAttack) {
        return currentState; // Do not modify state if attack is duplicated
    }
    
    // Add the new attack
    const newAttacks = [...currentState.attacks, attackPosition];

    // Rebuild the complete board state
    return createBoardState(currentState.ships, newAttacks);
}

/**
 * Rebuild board state when ships change (e.g. placement or after damage).
 */
export function updateBoardWithShips(
    currentState: BoardState, 
    newShips: Ship[]
): BoardState {
    return createBoardState(newShips, currentState.attacks);
}

/**
 * Check if a given position has already been attacked.
 */
export function wasPositionAttacked(boardState: BoardState, position: Position): boolean {
    return boardState.attacks.some(
        attack => attack.row === position.row && attack.col === position.col
    );
}