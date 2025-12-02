import type { CellState, Position } from './types';
import { BOARD_SIZE } from './constants';

/**
 * Convert position to coordinate string (e.g., {row: 0, col: 1} -> "B1")
 */
export function positionToCoordinate(position: Position): string {
    return `${String.fromCharCode(65 + position.col)}${position.row + 1}`;
}
/**
 * Generate empty board matrix
 */
export function createEmptyBoard(size: number = BOARD_SIZE): CellState[][] {
    return Array(size).fill(null).map(() => Array(size).fill('empty'));
}
