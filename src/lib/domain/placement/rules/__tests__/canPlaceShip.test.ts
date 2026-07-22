import { canPlaceShip } from '../canPlaceShip';



import type { ShipPlacement } from '../../models/ShipPlacement';

import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';

describe('canPlaceShip', () => {
    const mockShip: BaseShip = {
        type: 'carrier',
        size: 5,
    };

    const mockSmallShip: BaseShip = {
        type: 'destroyer',
        size: 2,
    };

    describe('valid placements', () => {
        it('should validate placement fully inside board', () => {
            const result = canPlaceShip({
                boardSize: 10,
                ship: mockShip,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
                existingPlacements: [],
            });

            expect(result.valid).toBe(true);
        });

        it('should validate placement in middle of board', () => {
            const result = canPlaceShip({
                boardSize: 10,
                ship: mockShip,
                origin: { row: 3, col: 3 },
                orientation: 'horizontal',
                existingPlacements: [],
            });

            expect(result.valid).toBe(true);
        });

        it('should validate placement touching board edge', () => {
            const result = canPlaceShip({
                boardSize: 10,
                ship: mockSmallShip,
                origin: { row: 9, col: 8 },
                orientation: 'horizontal',
                existingPlacements: [],
            });

            expect(result.valid).toBe(true);
        });
    });

    describe('out of bounds - horizontal', () => {
        it('should reject placement exceeding board width (right edge)', () => {
            const result = canPlaceShip({
                boardSize: 10,
                ship: mockShip,
                origin: { row: 0, col: 6 },
                orientation: 'horizontal',
                existingPlacements: [],
            });

            expect(result.valid).toBe(false);
            expect(result.valid === false && result.error).toBe('OUT_OF_BOUNDS');
        });

        it('should reject placement with negative column', () => {
            const result = canPlaceShip({
                boardSize: 10,
                ship: mockShip,
                origin: { row: 0, col: -1 },
                orientation: 'horizontal',
                existingPlacements: [],
            });

            expect(result.valid).toBe(false);
            expect(result.valid === false && result.error).toBe('OUT_OF_BOUNDS');
        });
    });

    describe('out of bounds - vertical', () => {
        it('should reject placement exceeding board height (bottom edge)', () => {
            const result = canPlaceShip({
                boardSize: 10,
                ship: mockShip,
                origin: { row: 6, col: 0 },
                orientation: 'vertical',
                existingPlacements: [],
            });

            expect(result.valid).toBe(false);
            expect(result.valid === false && result.error).toBe('OUT_OF_BOUNDS');
        });

        it('should reject placement with negative row', () => {
            const result = canPlaceShip({
                boardSize: 10,
                ship: mockShip,
                origin: { row: -1, col: 0 },
                orientation: 'vertical',
                existingPlacements: [],
            });

            expect(result.valid).toBe(false);
            expect(result.valid === false && result.error).toBe('OUT_OF_BOUNDS');
        });
    });

    describe('overlap detection', () => {
        it('should reject placement that overlaps existing ship', () => {
            const existingPlacement: ShipPlacement = {
                ship: mockSmallShip,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            };

            const result = canPlaceShip({
                boardSize: 10,
                ship: mockShip,
                origin: { row: 0, col: 0 },
                orientation: 'vertical',
                existingPlacements: [existingPlacement],
            });

            expect(result.valid).toBe(false);
            expect(result.valid === false && result.error).toBe('OVERLAP');
        });

        it('should reject placement that partially overlaps existing ship', () => {
            const existingPlacement: ShipPlacement = {
                ship: mockSmallShip,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            };

            const result = canPlaceShip({
                boardSize: 10,
                ship: mockShip,
                origin: { row: 0, col: 1 },
                orientation: 'vertical',
                existingPlacements: [existingPlacement],
            });

            expect(result.valid).toBe(false);
            expect(result.valid === false && result.error).toBe('OVERLAP');
        });

        it('should allow placement adjacent to existing ship', () => {
            const existingPlacement: ShipPlacement = {
                ship: mockSmallShip,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            };

            const result = canPlaceShip({
                boardSize: 10,
                ship: mockSmallShip,
                origin: { row: 0, col: 2 },
                orientation: 'horizontal',
                existingPlacements: [existingPlacement],
            });

            expect(result.valid).toBe(true);
        });
    });

    describe('empty existing placements', () => {
        it('should allow valid placement with empty existing ships', () => {
            const result = canPlaceShip({
                boardSize: 10,
                ship: mockShip,
                origin: { row: 5, col: 5 },
                orientation: 'horizontal',
                existingPlacements: [],
            });

            expect(result.valid).toBe(true);
        });
    });

    describe('deterministic validation', () => {
        it('should always return same result for same inputs', () => {
            const params = {
                boardSize: 10,
                ship: mockShip,
                origin: { row: 3, col: 3 },
                orientation: 'horizontal' as const,
                existingPlacements: [],
            };

            const result1 = canPlaceShip(params);
            const result2 = canPlaceShip(params);

            expect(result1).toEqual(result2);
        });

        it('should be deterministic with multiple existing ships', () => {
            const existingShips: ShipPlacement[] = [
                {
                    ship: mockSmallShip,
                    origin: { row: 0, col: 0 },
                    orientation: 'horizontal',
                },
                {
                    ship: mockSmallShip,
                    origin: { row: 5, col: 5 },
                    orientation: 'vertical',
                },
            ];

            const params = {
                boardSize: 10,
                ship: mockShip,
                origin: { row: 2, col: 2 },
                orientation: 'horizontal' as const,
                existingPlacements: existingShips,
            };

            const result1 = canPlaceShip(params);
            const result2 = canPlaceShip(params);

            expect(result1).toEqual(result2);
        });
    });

    describe('edge cases', () => {
        it('should handle ship of size 1', () => {
            const singleCellShip: BaseShip = {
                type: 'cruiser',
                size: 1,
            };

            const result = canPlaceShip({
                boardSize: 10,
                ship: singleCellShip,
                origin: { row: 9, col: 9 },
                orientation: 'horizontal',
                existingPlacements: [],
            });

            expect(result.valid).toBe(true);
        });

        it('should handle full-width horizontal placement', () => {
            const fullWidthShip: BaseShip = {
                type: 'battleship',
                size: 10,
            };

            const result = canPlaceShip({
                boardSize: 10,
                ship: fullWidthShip,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
                existingPlacements: [],
            });

            expect(result.valid).toBe(true);
        });

        it('should handle full-height vertical placement', () => {
            const fullHeightShip: BaseShip = {
                type: 'battleship',
                size: 10,
            };

            const result = canPlaceShip({
                boardSize: 10,
                ship: fullHeightShip,
                origin: { row: 0, col: 0 },
                orientation: 'vertical',
                existingPlacements: [],
            });

            expect(result.valid).toBe(true);
        });
    });
});
