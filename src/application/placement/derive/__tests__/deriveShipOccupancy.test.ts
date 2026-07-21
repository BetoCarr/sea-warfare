import { deriveShipOccupancy } from '../deriveShipOccupancy';



import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

describe('deriveShipOccupancy', () => {
    it('returns an empty array when no placements are provided', () => {
        expect(deriveShipOccupancy([])).toEqual([]);
    });

    it('expands a horizontal placement into the expected cells and ship types', () => {
        const placement: ShipPlacement = {
            ship: { type: 'destroyer', size: 2 },
            origin: { row: 0, col: 0 },
            orientation: 'horizontal',
        };

        const cells = deriveShipOccupancy([placement]);

        expect(cells).toEqual([
            { position: { row: 0, col: 0 }, shipType: 'destroyer' },
            { position: { row: 0, col: 1 }, shipType: 'destroyer' },
        ]);
    });

    it('expands a vertical placement into the expected cells and ship types', () => {
        const placement: ShipPlacement = {
            ship: { type: 'cruiser', size: 3 },
            origin: { row: 2, col: 4 },
            orientation: 'vertical',
        };

        const cells = deriveShipOccupancy([placement]);

        expect(cells).toEqual([
            { position: { row: 2, col: 4 }, shipType: 'cruiser' },
            { position: { row: 3, col: 4 }, shipType: 'cruiser' },
            { position: { row: 4, col: 4 }, shipType: 'cruiser' },
        ]);
    });

    it('preserves the same shipType for every generated cell', () => {
        const placement: ShipPlacement = {
            ship: { type: 'submarine', size: 3 },
            origin: { row: 1, col: 2 },
            orientation: 'horizontal',
        };

        const cells = deriveShipOccupancy([placement]);

        expect(cells).toHaveLength(3);
        expect(cells.map((cell) => cell.shipType)).toEqual(['submarine', 'submarine', 'submarine']);
    });

    it('creates all occupied cells for multiple placements and preserves each ship identity', () => {
        const placements: ShipPlacement[] = [
            {
                ship: { type: 'carrier', size: 2 },
                origin: { row: 1, col: 1 },
                orientation: 'horizontal',
            },
            {
                ship: { type: 'submarine', size: 3 },
                origin: { row: 4, col: 2 },
                orientation: 'vertical',
            },
        ];

        const cells = deriveShipOccupancy(placements);

        expect(cells).toEqual([
            { position: { row: 1, col: 1 }, shipType: 'carrier' },
            { position: { row: 1, col: 2 }, shipType: 'carrier' },
            { position: { row: 4, col: 2 }, shipType: 'submarine' },
            { position: { row: 5, col: 2 }, shipType: 'submarine' },
            { position: { row: 6, col: 2 }, shipType: 'submarine' },
        ]);
        expect(cells).toHaveLength(5);
        expect(cells.filter((cell) => cell.shipType === 'carrier')).toHaveLength(2);
        expect(cells.filter((cell) => cell.shipType === 'submarine')).toHaveLength(3);
    });
});
