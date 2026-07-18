import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import { getShipCoordinates } from '@/lib/domain/placement/rules/getShipCoordinates';
import { deriveLogicalCellInfo } from '../deriveLogicalCellInfo';

describe('deriveLogicalCellInfo', () => {
    it('returns water when no ship occupies the queried position', () => {
        const placements: ShipPlacement[] = [
            {
                ship: { type: 'destroyer', size: 2 },
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            },
        ];

        const result = deriveLogicalCellInfo({ row: 5, col: 5 }, placements);

        expect(result).toEqual({
            state: 'water',
        });
        expect(result.shipType).toBeUndefined();
    });

    it('returns ship and the correct shipType when the queried position is occupied', () => {
        const placements: ShipPlacement[] = [
            {
                ship: { type: 'battleship', size: 4 },
                origin: { row: 2, col: 2 },
                orientation: 'vertical',
            },
        ];

        const result = deriveLogicalCellInfo({ row: 4, col: 2 }, placements);

        expect(result).toEqual({
            state: 'ship',
            shipType: 'battleship',
        });
    });

    it('returns ship when querying the origin cell of a placement', () => {
        const placement: ShipPlacement = {
            ship: { type: 'carrier', size: 2 },
            origin: { row: 3, col: 3 },
            orientation: 'horizontal',
        };

        const result = deriveLogicalCellInfo(placement.origin, [placement]);

        expect(result).toEqual({
            state: 'ship',
            shipType: 'carrier',
        });
    });

    it('correctly identifies every occupied cell of a horizontal ship', () => {
        const placement: ShipPlacement = {
            ship: { type: 'submarine', size: 3 },
            origin: { row: 1, col: 4 },
            orientation: 'horizontal',
        };

        const occupiedCells = getShipCoordinates({
            origin: placement.origin,
            size: placement.ship.size,
            orientation: placement.orientation,
        });

        for (const position of occupiedCells) {
            expect(deriveLogicalCellInfo(position, [placement])).toEqual({
                state: 'ship',
                shipType: 'submarine',
            });
        }
    });

    it('correctly identifies every occupied cell of a vertical ship', () => {
        const placement: ShipPlacement = {
            ship: { type: 'cruiser', size: 3 },
            origin: { row: 3, col: 7 },
            orientation: 'vertical',
        };

        const occupiedCells = getShipCoordinates({
            origin: placement.origin,
            size: placement.ship.size,
            orientation: placement.orientation,
        });

        for (const position of occupiedCells) {
            expect(deriveLogicalCellInfo(position, [placement])).toEqual({
                state: 'ship',
                shipType: 'cruiser',
            });
        }
    });

    it('correctly distinguishes multiple ships on the board', () => {
        const placements: ShipPlacement[] = [
            {
                ship: { type: 'carrier', size: 2 },
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            },
            {
                ship: { type: 'destroyer', size: 3 },
                origin: { row: 5, col: 5 },
                orientation: 'vertical',
            },
        ];

        expect(deriveLogicalCellInfo({ row: 0, col: 1 }, placements)).toEqual({
            state: 'ship',
            shipType: 'carrier',
        });
        expect(deriveLogicalCellInfo({ row: 7, col: 5 }, placements)).toEqual({
            state: 'ship',
            shipType: 'destroyer',
        });
    });

    it('returns water for an empty cell between ships', () => {
        const placements: ShipPlacement[] = [
            {
                ship: { type: 'submarine', size: 3 },
                origin: { row: 2, col: 2 },
                orientation: 'horizontal',
            },
            {
                ship: { type: 'battleship', size: 4 },
                origin: { row: 5, col: 5 },
                orientation: 'vertical',
            },
        ];

        expect(deriveLogicalCellInfo({ row: 4, col: 5 }, placements)).toEqual({
            state: 'water',
        });
    });

    it('returns water for an unrelated empty cell', () => {
        const placements: ShipPlacement[] = [
            {
                ship: { type: 'submarine', size: 3 },
                origin: { row: 2, col: 2 },
                orientation: 'horizontal',
            },
            {
                ship: { type: 'battleship', size: 4 },
                origin: { row: 5, col: 5 },
                orientation: 'vertical',
            },
        ];

        expect(deriveLogicalCellInfo({ row: 0, col: 9 }, placements)).toEqual({
            state: 'water',
        });
    });
});
