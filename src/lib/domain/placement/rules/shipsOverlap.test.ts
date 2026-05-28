import { shipsOverlap } from './shipsOverlap';

describe('shipsOverlap', () => {
    describe('overlap detection', () => {
        it('should detect direct overlap at same position', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
            ];

            const shipB = [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
            ];

            expect(shipsOverlap({ shipA, shipB })).toBe(true);
        });

        it('should detect partial overlap', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
            ];

            const shipB = [
                { row: 0, col: 1 },
                { row: 0, col: 2 },
                { row: 0, col: 3 },
            ];

            expect(shipsOverlap({ shipA, shipB })).toBe(true);
        });

        it('should detect single-cell overlap', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
            ];

            const shipB = [
                { row: 0, col: 1 },
            ];

            expect(shipsOverlap({ shipA, shipB })).toBe(true);
        });

        it('should detect overlap when ships are vertical', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 1, col: 0 },
                { row: 2, col: 0 },
            ];

            const shipB = [
                { row: 1, col: 0 },
                { row: 2, col: 0 },
                { row: 3, col: 0 },
            ];

            expect(shipsOverlap({ shipA, shipB })).toBe(true);
        });

        it('should detect overlap when ships are at angles', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
            ];

            const shipB = [
                { row: 0, col: 1 },
                { row: 1, col: 1 },
                { row: 2, col: 1 },
            ];

            expect(shipsOverlap({ shipA, shipB })).toBe(true);
        });
    });

    describe('no overlap', () => {
        it('should return false when ships do not overlap', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
            ];

            const shipB = [
                { row: 0, col: 3 },
                { row: 0, col: 4 },
            ];

            expect(shipsOverlap({ shipA, shipB })).toBe(false);
        });

        it('should return false for adjacent horizontal ships', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
            ];

            const shipB = [
                { row: 0, col: 2 },
                { row: 0, col: 3 },
            ];

            expect(shipsOverlap({ shipA, shipB })).toBe(false);
        });

        it('should return false for adjacent vertical ships', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 1, col: 0 },
            ];

            const shipB = [
                { row: 2, col: 0 },
                { row: 3, col: 0 },
            ];

            expect(shipsOverlap({ shipA, shipB })).toBe(false);
        });

        it('should return false for diagonally adjacent ships', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
            ];

            const shipB = [
                { row: 1, col: 1 },
                { row: 1, col: 2 },
            ];

            expect(shipsOverlap({ shipA, shipB })).toBe(false);
        });

        it('should return false for completely separated ships', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
            ];

            const shipB = [
                { row: 5, col: 5 },
                { row: 5, col: 6 },
                { row: 5, col: 7 },
            ];

            expect(shipsOverlap({ shipA, shipB })).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle empty shipA', () => {
            const shipA: Array<{ row: number; col: number }> = [];

            const shipB = [{ row: 0, col: 0 }];

            expect(shipsOverlap({ shipA, shipB })).toBe(false);
        });

        it('should handle empty shipB', () => {
            const shipA = [{ row: 0, col: 0 }];

            const shipB: Array<{ row: number; col: number }> = [];

            expect(shipsOverlap({ shipA, shipB })).toBe(false);
        });

        it('should handle single-cell ships', () => {
            const shipA = [{ row: 0, col: 0 }];

            const shipB = [{ row: 0, col: 0 }];

            expect(shipsOverlap({ shipA, shipB })).toBe(true);
        });

        it('should handle single-cell ships that do not overlap', () => {
            const shipA = [{ row: 0, col: 0 }];

            const shipB = [{ row: 1, col: 1 }];

            expect(shipsOverlap({ shipA, shipB })).toBe(false);
        });
    });

    describe('deterministic behavior', () => {
        it('should return same result for same inputs', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
            ];

            const shipB = [
                { row: 0, col: 1 },
                { row: 0, col: 2 },
                { row: 0, col: 3 },
            ];

            const params = { shipA, shipB };

            const result1 = shipsOverlap(params);
            const result2 = shipsOverlap(params);

            expect(result1).toBe(result2);
        });

        it('should be symmetric in detection (order matters for function, not result)', () => {
            const shipA = [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
            ];

            const shipB = [
                { row: 0, col: 1 },
                { row: 0, col: 2 },
            ];

            const overlapAB = shipsOverlap({ shipA, shipB });
            const overlapBA = shipsOverlap({ shipA: shipB, shipB: shipA });

            expect(overlapAB).toBe(overlapBA);
        });
    });

    describe('large coordinate sets', () => {
        it('should efficiently handle large coordinate sets', () => {
            const largeShipA = Array.from({ length: 100 }, (_, i) => ({
                row: 0,
                col: i,
            }));

            const largeShipB = Array.from({ length: 100 }, (_, i) => ({
                row: 1,
                col: i,
            }));

            expect(shipsOverlap({ shipA: largeShipA, shipB: largeShipB })).toBe(
                false
            );
        });

        it('should detect overlap in large coordinate sets', () => {
            const largeShipA = Array.from({ length: 100 }, (_, i) => ({
                row: 0,
                col: i,
            }));

            const largeShipB = Array.from({ length: 100 }, (_, i) => ({
                row: 0,
                col: i,
            }));

            expect(shipsOverlap({ shipA: largeShipA, shipB: largeShipB })).toBe(
                true
            );
        });
    });
});
