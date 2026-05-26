import type { Position } from "@/lib/domain/shared/models/Position";
import type { BoardState } from "../board/board-sync";
import { isPositionInBounds } from "../board/board-factory";


import { findShipAtPosition } from "../ships/ship-queries";

/**
 * Choose a target position for the AI.
 * Strategy:
 * 1. HUNT: If there are hits on ships that aren't sunk, target adjacent cells.
 * 2. RANDOM: Otherwise, pick a random available cell.
 */
export function chooseAIAttackPosition(boardState: BoardState, boardSize: number): Position {
    // Helper: check if a position was already attacked
    const wasAttacked = (pos: Position) =>
        boardState.attacks.some(a => a.row === pos.row && a.col === pos.col);

    // --- HUNT MODE ---
    const huntTarget = getHuntTarget(boardState, boardSize, wasAttacked);
    if (huntTarget) {
        console.log("[AI] 🎯 Hunting target:", huntTarget);
        return huntTarget;
    }

    // --- RANDOM MODE ---
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

    return { row: 0, col: 0 };
}

/**
 * Finds a target adjacent to an existing hit on a non-sunk ship.
 */
function getHuntTarget(
    boardState: BoardState, 
    boardSize: number, 
    wasAttacked: (p: Position) => boolean
): Position | null {
    // 1. Find all hits that belong to ships that are NOT sunk
    const activeHits = boardState.hits.filter(hitPos => {
        const ship = findShipAtPosition(boardState.ships, hitPos);
        return ship && !ship.isSunk;
    });

    if (activeHits.length === 0) return null;

    // 2. For each active hit, check neighbors
    const neighbors: Position[] = [];
    const directions = [
        { row: -1, col: 0 }, // Up
        { row: 1, col: 0 },  // Down
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 }   // Right
    ];

    // Simple heuristic: just gather all valid unattacked neighbors of all active hits
    // A smarter AI would follow a line (parity/direction), but this is "Phase 2" smart.
    for (const hit of activeHits) {
        for (const dir of directions) {
            const target = { row: hit.row + dir.row, col: hit.col + dir.col };
            if (isPositionInBounds(target, boardSize) && !wasAttacked(target)) {
                // Return immediately the first valid neighbor found (simple hunt)
                return target;
            }
        }
    }

    return null;
}