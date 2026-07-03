import type { Position } from '@/lib/domain/shared/models/Position';
import type { Orientation } from '../models/Orientation';

export type GetShipCoordinatesParams = {
    origin: Position;
    size: number;
    orientation: Orientation;
};

/**
 * Derives all occupied coordinates for a ship given its origin, size, and orientation.
 */
export function getShipCoordinates(
    params: GetShipCoordinatesParams,
): Position[] {
    const { origin, size, orientation } = params;
    const coordinates: Position[] = [];

    for (let i = 0; i < size; i++) {
        if (orientation === 'horizontal') {
            coordinates.push({
                row: origin.row,
                col: origin.col + i,
            });
        } else {
            coordinates.push({
                row: origin.row + i,
                col: origin.col,
            });
        }
    }

    return coordinates;
}
