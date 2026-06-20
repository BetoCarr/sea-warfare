import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';
import type { ShipPlacement } from '../models/ShipPlacement';
import { upsertShipPlacement } from './upsertShipPlacement';

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

function buildPlacement(ship: BaseShip, row: number, col: number): ShipPlacement {
    return {
        ship,
        origin: { row, col },
        orientation: 'horizontal',
    };
}

describe('upsertShipPlacement', () => {

    describe('successful placement', () => {
        it('should place valid ship and return success: true', () => {
            const placement = buildPlacement(mockCarrier, 0, 0);

            const result = upsertShipPlacement({
                existingPlacements: [],
                placement,
                boardSize: 10,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.placements).toHaveLength(1);
            }
        });

        it('should preserve unrelated placements when adding a new one', () => {
            const existingPlacement = buildPlacement(mockDestroyer, 0, 0);

            const newPlacement = buildPlacement(mockCruiser, 2, 0);

            const result = upsertShipPlacement({
                existingPlacements: [existingPlacement],
                placement: newPlacement,
                boardSize: 10,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.placements).toHaveLength(2);
                expect(result.placements).toContain(existingPlacement);
                expect(result.placements).toContain(newPlacement);
            }
        });

        it('should return updated placements array', () => {
            const placement = {
                ...buildPlacement(mockCarrier, 5, 5),
                orientation: 'vertical' as const,
            };

            const result = upsertShipPlacement({
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
            const original: ShipPlacement[] = [buildPlacement(mockDestroyer, 0, 0)];

            const originalLength = original.length;
            const placement = buildPlacement(mockCarrier, 2, 0);

            upsertShipPlacement({
                existingPlacements: original,
                placement,
                boardSize: 10,
            });

            expect(original.length).toBe(originalLength);
        });
    });

    describe('failed placement', () => {
        it('should return success: false when placement is invalid', () => {
            const existingPlacement = buildPlacement(mockDestroyer, 0, 0);

            const overlappingPlacement = {
                ...buildPlacement(mockCarrier, 0, 0),
                orientation: 'vertical' as const,
            };

            const result = upsertShipPlacement({
                existingPlacements: [existingPlacement],
                placement: overlappingPlacement,
                boardSize: 10,
            });

            expect(result.success).toBe(false);
        });

        it('should return error when ship goes out of bounds', () => {
            const placement = buildPlacement(mockCarrier, 0, 6);

            const result = upsertShipPlacement({
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
            const existingPlacement = buildPlacement(mockDestroyer, 0, 0);

            const overlappingPlacement = buildPlacement(mockCruiser, 0, 1);

            const result = upsertShipPlacement({
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
        it('should preserve all unrelated placements when adding new one', () => {
            const ship1 = buildPlacement(mockDestroyer, 0, 0);

            const ship2 = {
                ...buildPlacement(mockCruiser, 3, 0),
                orientation: 'vertical' as const,
            };

            const ship3 = buildPlacement(mockCarrier, 0, 5);

            const result = upsertShipPlacement({
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


    // Tests specifically focused on the ship replacement behavior
    describe('ship replacement behavior', () => {
        it('should replace an existing placement with the same ShipType', () => {
            const existingCarrier = buildPlacement(mockCarrier, 0, 0);
            const replacementCarrier = buildPlacement(mockCarrier, 5, 2);

            const result = upsertShipPlacement({
                existingPlacements: [existingCarrier],
                placement: replacementCarrier,
                boardSize: 10,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.placements).toHaveLength(1);
                expect(result.placements).not.toContain(existingCarrier);
                expect(result.placements).toContain(replacementCarrier);
            }
        });

        it('should keep fleet size unchanged when replacing an existing ship', () => {
            const destroyerPlacement = buildPlacement(mockDestroyer, 3, 0);
            const existingCarrier = buildPlacement(mockCarrier, 0, 0);
            const replacementCarrier = buildPlacement(mockCarrier, 5, 2);

            const result = upsertShipPlacement({
                existingPlacements: [destroyerPlacement, existingCarrier],
                placement: replacementCarrier,
                boardSize: 10,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.placements).toHaveLength(2);
                expect(result.placements).toContain(destroyerPlacement);
                expect(result.placements).toContain(replacementCarrier);
                expect(result.placements).not.toContain(existingCarrier);
            }
        });

        it('should preserve other ships when replacing a ship placement', () => {
            const destroyerPlacement = buildPlacement(mockDestroyer, 3, 0);
            const existingCarrier = buildPlacement(mockCarrier, 0, 0);
            const replacementCarrier = buildPlacement(mockCarrier, 5, 2);

            const result = upsertShipPlacement({
                existingPlacements: [destroyerPlacement, existingCarrier],
                placement: replacementCarrier,
                boardSize: 10,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.placements).toHaveLength(2);
                expect(result.placements).toContain(destroyerPlacement);
                expect(result.placements).toContain(replacementCarrier);
                expect(result.placements).not.toContain(existingCarrier);
            }
        });

        it('should validate replacement against remaining fleet', () => {
            const destroyerPlacement = buildPlacement(mockDestroyer, 0, 0);
            const existingCarrier = buildPlacement(mockCarrier, 4, 4);
            const overlappingCarrier = buildPlacement(mockCarrier, 0, 1);

            const result = upsertShipPlacement({
                existingPlacements: [destroyerPlacement, existingCarrier],
                placement: overlappingCarrier,
                boardSize: 10,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('OVERLAP');
            }
        });

        it('should allow self-replacement without self-collision during validation', () => {
            const existingCarrier = buildPlacement(mockCarrier, 0, 0);
            const replacementCarrier = buildPlacement(mockCarrier, 0, 5);

            const result = upsertShipPlacement({
                existingPlacements: [existingCarrier],
                placement: replacementCarrier,
                boardSize: 10,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.placements).toEqual([replacementCarrier]);
            }
        });
    });

    describe('edge cases', () => {
        it('should allow placement near board boundaries when valid', () => {
            const singleShip = buildPlacement(mockDestroyer, 0, 0);

            const result = upsertShipPlacement({
                existingPlacements: [singleShip],
                placement: {
                    ...buildPlacement(mockCruiser, 9, 7),
                    orientation: 'horizontal' as const,
                },
                boardSize: 10,
            });

            expect(result.success).toBe(true);
        });


        it('should reject placement exceeding right board edge', () => {
            const result = upsertShipPlacement({
                existingPlacements: [],
                placement: {
                    ...buildPlacement(mockCruiser, 9, 8),
                    orientation: 'horizontal' as const,
                },
                boardSize: 10,
            });

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error).toBe('OUT_OF_BOUNDS');
            }
        });



        it('should use default board size when not provided', () => {
            const placement = buildPlacement(mockCarrier, 0, 0);

            // Should not throw; uses DEFAULT_BOARD_SIZE
            const result = upsertShipPlacement({
                existingPlacements: [],
                placement,
            });

            expect(result.success).toBe(true);
        });
    });
});
