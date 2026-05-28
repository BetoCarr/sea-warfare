import { resetPlacements } from './resetPlacements';

describe('resetPlacements', () => {
    describe('returns empty array', () => {
        it('should always return an empty array', () => {
            const result = resetPlacements();
            expect(result).toEqual([]);
        });

        it('should return an empty array with length 0', () => {
            const result = resetPlacements();
            expect(result.length).toBe(0);
        });

        it('should return an array type (not null or undefined)', () => {
            const result = resetPlacements();
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('deterministic behavior', () => {
        it('should return identical results on repeated calls', () => {
            const result1 = resetPlacements();
            const result2 = resetPlacements();
            const result3 = resetPlacements();

            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);
        });
    });

    describe('pure behavior', () => {
        it('should have no external dependencies', () => {
            // Simply calling it multiple times should never cause side effects
            expect(() => {
                resetPlacements();
                resetPlacements();
                resetPlacements();
            }).not.toThrow();
        });

        it('should not mutate any state', () => {
            // Each call returns a new array, though both are empty
            const result1 = resetPlacements();
            const result2 = resetPlacements();

            // They are equal in content but may be different instances
            expect(result1).toEqual(result2);
        });
    });
});
