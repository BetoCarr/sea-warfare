import { placeShipOnBoard } from './placeShipOnBoard';
import type { ShipPlacement } from '../models/ShipPlacement';
import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';

describe('placeShipOnBoard', () => {
    const mockCarrier: BaseShip = {
        type: 'carrier',
        size: 5,
    };

    const mockDestroyer: BaseShip = {
        type: 'destroyer',
        size: 2,
    };

    const mockCruiser: BaseShip = {
        type: 'cruiser',
        size: 3,
    };

    describe('successful placement', () => {
        it('should place valid ship and return success: true', () => {
            const placement: ShipPlacement = {
                ship: mockCarrier,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            };

            const result = placeShipOnBoard({
                existingPlacements: [],
                placement,
                boardSize: 10,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.placements).toHaveLength(1);
            }
        });

        it('should append new placement to existing placements', () => {
            const existingPlacement: ShipPlacement = {
                ship: mockDestroyer,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            };

            const newPlacement: ShipPlacement = {
                ship: mockCruiser,
                origin: { row: 2, col: 0 },
                orientation: 'horizontal',
            };

            const result = placeShipOnBoard({
                existingPlacements: [existingPlacement],
                placement: newPlacement,
                boardSize: 10,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.placements).toHaveLength(2);
                expect(result.placements[0]).toBe(existingPlacement);
                expect(result.placements[1]).toBe(newPlacement);
            }
        });

        it('should return updated placements array', () => {
            const placement: ShipPlacement = {
                ship: mockCarrier,
                origin: { row: 5, col: 5 },
                orientation: 'vertical',
            };

            const result = placeShipOnBoard({
                existingPlacements: [],
                placement,
                boardSize: 10,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.placements[0]).toEqual(placement);
            }
        });
    });

    describe('immutable behavior', () => {
        it('should not mutate the original placements array', () => {
            const original: ShipPlacement[] = [
                {
                    ship: mockDestroyer,
                    origin: { row: 0, col: 0 },
                    orientation: 'horizontal',
                },
            ];

            const originalLength = original.length;
            const placement: ShipPlacement = {
                ship: mockCarrier,
                origin: { row: 2, col: 0 },
                orientation: 'horizontal',
            };

            placeShipOnBoard({
                existingPlacements: original,
                placement,
                boardSize: 10,
            });

            expect(original.length).toBe(originalLength);
        });
    });

    describe('failed placement', () => {
        it('should return success: false when placement is invalid', () => {
            const existingPlacement: ShipPlacement = {
                ship: mockDestroyer,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            };

            const overlappingPlacement: ShipPlacement = {
                ship: mockCarrier,
                origin: { row: 0, col: 0 },
                orientation: 'vertical',
            };

            const result = placeShipOnBoard({
                existingPlacements: [existingPlacement],
                placement: overlappingPlacement,
                boardSize: 10,
            });

            expect(result.success).toBe(false);
        });

        it('should return error when ship goes out of bounds', () => {
            const placement: ShipPlacement = {
                ship: mockCarrier,
                origin: { row: 0, col: 6 },
                orientation: 'horizontal',
            };

            const result = placeShipOnBoard({
                existingPlacements: [],
                placement,
                boardSize: 10,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('OUT_OF_BOUNDS');
            }
        });

        it('should return OVERLAP error when placement overlaps', () => {
            const existingPlacement: ShipPlacement = {
                ship: mockDestroyer,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            };

            const overlappingPlacement: ShipPlacement = {
                ship: mockCruiser,
                origin: { row: 0, col: 1 },
                orientation: 'horizontal',
            };

            const result = placeShipOnBoard({
                existingPlacements: [existingPlacement],
                placement: overlappingPlacement,
                boardSize: 10,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('OVERLAP');
            }
        });
    });

    describe('placement composition', () => {
        it('should preserve all existing placements when adding new one', () => {
            const ship1: ShipPlacement = {
                ship: mockDestroyer,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            };

            const ship2: ShipPlacement = {
                ship: mockCruiser,
                origin: { row: 3, col: 0 },
                orientation: 'vertical',
            };

            const ship3: ShipPlacement = {
                ship: mockCarrier,
                origin: { row: 0, col: 5 },
                orientation: 'horizontal',
            };

            const result = placeShipOnBoard({
                existingPlacements: [ship1, ship2],
                placement: ship3,
                boardSize: 10,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.placements).toContain(ship1);
                expect(result.placements).toContain(ship2);
                expect(result.placements).toContain(ship3);
            }
        });
    });

    describe('delegated validation behavior', () => {
        it('should use canPlaceShip for validation semantics', () => {
            // This test ensures that placeShipOnBoard respects the same validation rules
            // as canPlaceShip by verifying a placement that should fail via canPlaceShip rules
            const existingPlacement: ShipPlacement = {
                ship: mockDestroyer,
                origin: { row: 5, col: 5 },
                orientation: 'vertical',
            };

            // Place ship that would overlap
            const invalidPlacement: ShipPlacement = {
                ship: mockCruiser,
                origin: { row: 5, col: 5 },
                orientation: 'horizontal',
            };

            const result = placeShipOnBoard({
                existingPlacements: [existingPlacement],
                placement: invalidPlacement,
                boardSize: 10,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(['OVERLAP', 'OUT_OF_BOUNDS']).toContain(result.error);
            }
        });
    });

    describe('edge cases', () => {
        it('should handle placement on a full board of only one ship', () => {
            const singleShip: ShipPlacement = {
                ship: mockDestroyer,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            };

            const result = placeShipOnBoard({
                existingPlacements: [singleShip],
                placement: {
                    ship: mockCruiser,
                    origin: { row: 9, col: 7 },
                    orientation: 'horizontal',
                },
                boardSize: 10,
            });

            expect(result.success).toBe(true);
        });


        it('should reject placement exceeding right board edge', () => {
            const result = placeShipOnBoard({
                existingPlacements: [],
                placement: {
                    ship: mockCruiser,
                    origin: { row: 9, col: 8 },
                    orientation: 'horizontal',
                },
                boardSize: 10,
            });

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error).toBe('OUT_OF_BOUNDS');
            }
        });



        it('should use default board size when not provided', () => {
            const placement: ShipPlacement = {
                ship: mockCarrier,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            };

            // Should not throw; uses DEFAULT_BOARD_SIZE
            const result = placeShipOnBoard({
                existingPlacements: [],
                placement,
            });

            expect(result.success).toBe(true);
        });
    });
});
