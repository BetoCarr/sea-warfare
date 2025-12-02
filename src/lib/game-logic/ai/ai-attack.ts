import type { Position } from "@/lib/utils/types";
import type { BoardState } from "../board/board-sync";
import { isPositionInBounds } from "../board/board-factory";


/**
 * Choose a random un-attacked position on the board.
 * Very simple strategy: random sample until we find an un-attacked cell.
 */
export function chooseAIAttackPosition(boardState: BoardState, boardSize: number): Position {
    // Quick helper: check if a position was already attacked
    const wasAttacked = (pos: Position) =>
        boardState.attacks.some(a => a.row === pos.row && a.col === pos.col);

    // Try random sampling N times then fallback to linear scan
    for (let i = 0; i < 100; i++) {
        const pos: Position = {
            row: Math.floor(Math.random() * boardSize),
            col: Math.floor(Math.random() * boardSize)
        };
        if (!wasAttacked(pos) && isPositionInBounds(pos, boardSize)) return pos;
    }

    // Fallback: find first free cell by scanning grid
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const pos = { row: r, col: c };
            if (!wasAttacked(pos)) return pos;
        }
    }

    // If all positions attacked (shouldn't happen), return 0,0
    return { row: 0, col: 0 };
}