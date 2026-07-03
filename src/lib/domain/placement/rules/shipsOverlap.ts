import type { Position } from '@/lib/domain/shared/models/Position';

export type ShipsOverlapParams = {
    shipA: Position[];
    shipB: Position[];
};

/**
 * Determines whether two coordinate collections overlap.
 */
export function shipsOverlap(
    params: ShipsOverlapParams,
): boolean {
    const { shipA, shipB } = params;

    const shipBSet = new Set(
        shipB.map(pos => `${pos.row},${pos.col}`)
    );

    for (const pos of shipA) {
        if (shipBSet.has(`${pos.row},${pos.col}`)) {
            return true;
        }
    }

    return false;
}
