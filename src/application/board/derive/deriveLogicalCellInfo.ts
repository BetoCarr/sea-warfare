import { getShipCoordinates } from '@/lib/domain/placement/rules/getShipCoordinates';



import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

import type { Position } from '@/lib/domain/shared/models/Position';

import type { ShipType } from '@/lib/domain/ships/models/ShipType';

export interface LogicalCellInfo {
    state: LogicalCellState;
    shipType?: ShipType;
}

export type LogicalCellState =
    | 'water'
    | 'ship';

export function deriveLogicalCellInfo(
    position: Position,
    placements: ShipPlacement[],
): LogicalCellInfo {

    for (const placement of placements) {

        const occupiedCells = getShipCoordinates({
            origin: placement.origin,
            size: placement.ship.size,
            orientation: placement.orientation,
        });

        const occupiesCell = occupiedCells.some(
            coordinate =>
                coordinate.row === position.row &&
                coordinate.col === position.col,
        );

        if (occupiesCell) {
            return {
                state: 'ship',
                shipType: placement.ship.type,
            };
        }
    }

    return {
        state: 'water',
    };
}