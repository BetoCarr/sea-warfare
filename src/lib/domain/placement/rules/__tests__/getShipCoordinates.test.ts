import { getShipCoordinates, type GetShipCoordinatesParams } from '../getShipCoordinates';

describe('getShipCoordinates', () => {
    describe('horizontal placement', () => {
        it('should generate correct coordinates for horizontal placement from (0,0)', () => {
            const result = getShipCoordinates({
                origin: { row: 0, col: 0 },
                size: 3,
                orientation: 'horizontal',
            });

            expect(result).toEqual([
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
            ]);
        });

        it('should preserve row while incrementing columns', () => {
            const result = getShipCoordinates({
                origin: { row: 5, col: 2 },
                size: 4,
                orientation: 'horizontal',
            });

            expect(result).toEqual([
                { row: 5, col: 2 },
                { row: 5, col: 3 },
                { row: 5, col: 4 },
                { row: 5, col: 5 },
            ]);
        });
    });

    describe('vertical placement', () => {
        it('should generate correct coordinates for vertical placement from (0,0)', () => {
            const result = getShipCoordinates({
                origin: { row: 0, col: 0 },
                size: 3,
                orientation: 'vertical',
            });

            expect(result).toEqual([
                { row: 0, col: 0 },
                { row: 1, col: 0 },
                { row: 2, col: 0 },
            ]);
        });

        it('should preserve column while incrementing rows', () => {
            const result = getShipCoordinates({
                origin: { row: 2, col: 7 },
                size: 5,
                orientation: 'vertical',
            });

            expect(result).toEqual([
                { row: 2, col: 7 },
                { row: 3, col: 7 },
                { row: 4, col: 7 },
                { row: 5, col: 7 },
                { row: 6, col: 7 },
            ]);
        });
    });

    describe('ship size correctness', () => {
        it('should generate exactly ship.size coordinates', () => {
            const size = 5;
            const result = getShipCoordinates({
                origin: { row: 0, col: 0 },
                size,
                orientation: 'horizontal',
            });

            expect(result.length).toBe(size);
        });

        it('should handle size of 1', () => {
            const result = getShipCoordinates({
                origin: { row: 3, col: 4 },
                size: 1,
                orientation: 'horizontal',
            });

            expect(result).toEqual([{ row: 3, col: 4 }]);
        });
    });

    describe('non-zero origins', () => {
        it('should correctly offset coordinates from arbitrary origin (horizontal)', () => {
            const result = getShipCoordinates({
                origin: { row: 4, col: 6 },
                size: 3,
                orientation: 'horizontal',
            });

            expect(result).toEqual([
                { row: 4, col: 6 },
                { row: 4, col: 7 },
                { row: 4, col: 8 },
            ]);
        });

        it('should correctly offset coordinates from arbitrary origin (vertical)', () => {
            const result = getShipCoordinates({
                origin: { row: 4, col: 6 },
                size: 3,
                orientation: 'vertical',
            });

            expect(result).toEqual([
                { row: 4, col: 6 },
                { row: 5, col: 6 },
                { row: 6, col: 6 },
            ]);
        });
    });

    describe('deterministic behavior', () => {
        it('should always produce the same coordinates for the same input', () => {
            const params: GetShipCoordinatesParams = {
                origin: { row: 3, col: 5 },
                size: 4,
                orientation: 'horizontal',
            };

            const result1 = getShipCoordinates(params);
            const result2 = getShipCoordinates(params);

            expect(result1).toEqual(result2);
        });
    });
});
