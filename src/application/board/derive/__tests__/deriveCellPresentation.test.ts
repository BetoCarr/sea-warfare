import { deriveCellPresentation } from '../deriveCellPresentation';



import type { ShipType } from '@/lib/domain/ships/models/ShipType';

describe('deriveCellPresentation', () => {
    it('builds the water presentation with the expected classes and metadata', () => {
        const result = deriveCellPresentation({ row: 0, col: 0 }, 'water');

        expect(result.visualState).toBe('water');
        expect(result.className).toContain('bg-slate-700');
        expect(result.className).toContain('border-slate-500');
        expect(result.className).toContain('hover:bg-slate-600');
        expect(result.content).toBe('');
        expect(result.ariaLabel).toBe('Cell A1: water');
        expect(result.title).toBe('A1');
    });

    it.each<[ShipType, string]>([
        ['carrier', 'bg-cyan-600'],
        ['battleship', 'bg-indigo-500'],
        ['cruiser', 'bg-violet-500'],
        ['submarine', 'bg-amber-500'],
        ['destroyer', 'bg-rose-500'],
    ])('uses the expected color classes for %s cells', (shipType, expectedColor) => {
        const result = deriveCellPresentation({ row: 2, col: 2 }, 'ship', shipType);

        expect(result.visualState).toBe('ship');
        expect(result.content).toBe('');
        expect(result.className).toContain('text-white');
        expect(result.className).toContain(expectedColor);
        expect(result.title).toBe('C3');
        expect(result.ariaLabel).toBe('Cell C3: ship');
    });

    it('builds the preview-valid presentation with preview classes and empty content', () => {
        const result = deriveCellPresentation({ row: 4, col: 1 }, 'preview-valid');

        expect(result.visualState).toBe('preview-valid');
        expect(result.className).toContain('bg-emerald-500/50');
        expect(result.className).toContain('border-emerald-400');
        expect(result.content).toBe('');
        expect(result.title).toBe('B5');
        expect(result.ariaLabel).toBe('Cell B5: preview-valid');
    });

    it('builds the preview-invalid presentation with preview classes and empty content', () => {
        const result = deriveCellPresentation({ row: 3, col: 7 }, 'preview-invalid');

        expect(result.visualState).toBe('preview-invalid');
        expect(result.className).toContain('bg-red-500/40');
        expect(result.className).toContain('border-red-400');
        expect(result.content).toBe('');
        expect(result.title).toBe('H4');
        expect(result.ariaLabel).toBe('Cell H4: preview-invalid');
    });

    it.each([
        [{ row: 0, col: 0 }, 'A1'],
        [{ row: 5, col: 3 }, 'D6'],
        [{ row: 9, col: 9 }, 'J10'],
    ])('formats coordinates into the expected title and aria label for %s', (position, expectedTitle) => {
        const result = deriveCellPresentation(position, 'water');

        expect(result.title).toBe(expectedTitle);
        expect(result.ariaLabel).toBe(`Cell ${expectedTitle}: water`);
    });

    it('falls back to the carrier color when no ship type is provided', () => {
        const result = deriveCellPresentation({ row: 0, col: 0 }, 'ship');

        expect(result.visualState).toBe('ship');
        expect(result.className).toContain('bg-cyan-600');
        expect(result.className).toContain('text-white');
        expect(result.content).toBe('');
        expect(result.title).toBe('A1');
        expect(result.ariaLabel).toBe('Cell A1: ship');
    });

    it('returns empty content for every current visual state', () => {
        const states = ['water', 'ship', 'preview-valid', 'preview-invalid'] as const;

        for (const visualState of states) {
            const result = deriveCellPresentation({ row: 1, col: 1 }, visualState, 'carrier');

            expect(result.content).toBe('');
        }
    });
});
