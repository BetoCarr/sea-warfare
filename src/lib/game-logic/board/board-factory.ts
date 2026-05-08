import type { CellState, Ship, Position } from '@/lib/utils/types';
import { BOARD_SIZE } from '@/lib/utils/constants';
import { getShipCoordinates } from '@/lib/game-logic/ships/ship-placement';

/**
 * Creates an empty board where all cells are set to 'empty'
 * @param size - Board size (default: BOARD_SIZE)
 * @returns 2D array of CellState with all cells initialized as 'empty'
 */
export function createEmptyBoard(size: number = BOARD_SIZE): CellState[][] {
    return Array.from({ length: size }, () => 
        Array.from({ length: size }, () => 'empty')
    );
}

/**
 * Builds a board marking only ship positions.
 * This board does NOT include attacks, only ship placements.
 * @param ships - Array of ships with positions
 * @param size - Board size
 * @returns Board with 'ship' cells where ships are placed, 'empty' otherwise
 */
export function createBoardFromShips(ships: Ship[], size: number = BOARD_SIZE): CellState[][] {
    const board = createEmptyBoard(size);
    
    ships.forEach(ship => {
        if (!ship.position) return; // skip unplaced ships
        
        // const coordinates = getShipCoordinates({ position: ship.position, orientation: ship.orientation, size: ship.size });
        const coordinates = getShipCoordinates(ship)
        coordinates.forEach(pos => {
            if (pos.row >= 0 && pos.row < size && pos.col >= 0 && pos.col < size) {
                board[pos.row][pos.col] = 'ship';
            }
        });
    });

    return board;
}

/**
 * Creates a deep copy of a board.
 * Useful to prevent accidental mutations of the original.
 * @param board - The board to copy
 * @returns A new board instance with identical values
 */
export function cloneBoard(board: CellState[][]): CellState[][] {
    return board.map(row => [...row]);
}

/**
 * Checks whether a position is within board boundaries
 * @param position - Position to check
 * @param size - Board size
 * @returns true if the position is valid, false otherwise
 */
export function isPositionInBounds(position: Position, size: number = BOARD_SIZE): boolean {
    return position.row >= 0 && 
            position.row < size && 
            position.col >= 0 && 
            position.col < size;
}

/**
 * Gets the state of a specific cell on the board
 * @param board - The board
 * @param position - Position to query
 * @returns The cell state or null if out of bounds
 */
export function getCellState(board: CellState[][], position: Position): CellState | null {
    if (!isPositionInBounds(position, board.length)) {
        return null;
    }

    return board[position.row][position.col];
}

/**
 * Sets the state of a specific cell (immutable).
 * Returns a new board instance with the updated cell.
 * @param board - The original board
 * @param position - Position to update
 * @param state - New cell state
 * @returns A new board with the modified cell
 */
export function setCellState(
    board: CellState[][], 
    position: Position, 
    state: CellState
): CellState[][] {
    if (!isPositionInBounds(position, board.length)) {
        return board; // No modificar si está fuera de límites
    }

    const newBoard = cloneBoard(board);
    newBoard[position.row][position.col] = state;
    return newBoard;
}