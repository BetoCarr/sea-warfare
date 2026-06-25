import type { Position } from '@/lib/domain/shared/models/Position';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';
import type { ShipPlacement } from '../../../lib/domain/placement/models/ShipPlacement';

export type ShipCell = {
    position: Position;
    shipType: ShipType;
};

export function deriveShipOccupancy(
    placements: ShipPlacement[],
): ShipCell[] {

    const cells: ShipCell[] = [];

    for (const placement of placements) {

        for (
            let offset = 0;
            offset < placement.ship.size;
            offset++
        ) {

            const position = {
                row:
                    placement.origin.row +
                    (
                        placement.orientation === 'vertical'
                            ? offset
                            : 0
                    ),
                col:
                    placement.origin.col +
                    (
                        placement.orientation === 'horizontal'
                            ? offset
                            : 0
                    ),
            };

            cells.push({
                position,
                shipType: placement.ship.type,
            });
        }
    }

    return cells;
}