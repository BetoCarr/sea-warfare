import type { Position } from '@/lib/domain/shared/models/Position';

export type ShipsOverlapParams = {
    shipA: Position[];
    shipB: Position[];
};

/**
 * Determines whether two coordinate collections overlap.
 * 
 * Pure function that:
 * - Compares two position arrays for intersection
 * - Returns true if any positions match
 * - Returns false if no overlap exists
 * - Has no side effects
 */
export function shipsOverlap(
    params: ShipsOverlapParams,
): boolean {
    const { shipA, shipB } = params;

    // Create a set from shipB for O(n) lookup instead of O(n²)
    const shipBSet = new Set(
        shipB.map(pos => `${pos.row},${pos.col}`)
    );

    // Check if any position in shipA exists in shipB
    for (const pos of shipA) {
        if (shipBSet.has(`${pos.row},${pos.col}`)) {
            return true;
        }
    }

    return false;
}
