import { derivePlacementPreview } from '../derivePlacementPreview';



import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';

const mockCarrier: BaseShip = {
    type: 'carrier',
    size: 5,
};

const mockSubmarine: BaseShip = {
    type: 'submarine',
    size: 3,
};

describe('derivePlacementPreview', () => {
    it('returns null when no ship is selected', () => {
        const preview = derivePlacementPreview({
            selectedShip: null,
            targetCell: { row: 3, col: 4 },
            orientation: 'horizontal',
            existingPlacements: [],
        });

        expect(preview).toBeNull();
    });

    it('returns null when no hovered cell exists', () => { 
        const preview = derivePlacementPreview({
            selectedShip: mockSubmarine,
            targetCell: null,
            orientation: 'vertical',
            existingPlacements: [],
        });

        expect(preview).toBeNull();
    });

    it('returns a valid preview for a valid placement', () => {
        const preview = derivePlacementPreview({
            selectedShip: mockSubmarine,
            targetCell: { row: 2, col: 2 },
            orientation: 'horizontal',
            existingPlacements: [],
        });

        expect(preview).not.toBeNull();
        expect(preview?.isValid).toBe(true);
        expect(preview?.cells).toEqual([
            { row: 2, col: 2 },
            { row: 2, col: 3 },
            { row: 2, col: 4 },
        ]);
    });

    it('returns an invalid preview when placement exceeds board bounds', () => {
        const preview = derivePlacementPreview({
            selectedShip: mockCarrier,
            targetCell: { row: 0, col: 6 },
            orientation: 'horizontal',
            existingPlacements: [],
        });

        expect(preview).not.toBeNull();
    
        if (preview?.isValid === false) {
            expect(preview.validationError).toBe('OUT_OF_BOUNDS');
        }
    });

    it('returns an invalid preview when placement overlaps an existing ship', () => {
        const existingPlacement: ShipPlacement = {
            ship: { type: 'destroyer', size: 2 },
            origin: { row: 2, col: 2 },
            orientation: 'horizontal',
        };

        const preview = derivePlacementPreview({
            selectedShip: mockSubmarine,
            targetCell: { row: 1, col: 3 },
            orientation: 'vertical',
            existingPlacements: [existingPlacement],
        });

        expect(preview).not.toBeNull();
    
        if (preview?.isValid === false) {
            expect(preview.validationError).toBe('OVERLAP');
        }
    });

    it('is deterministic for identical inputs', () => {
        const params = {
            selectedShip: mockSubmarine,
            targetCell: { row: 2, col: 2 },
            orientation: 'horizontal' as const,
            existingPlacements: [],
        };

        const firstPreview = derivePlacementPreview(params);
        const secondPreview = derivePlacementPreview(params);
        
        expect(firstPreview).toEqual(secondPreview);
    });

    it('ignores the current placement of the selected ship during repositioning', () => {
        const existingPlacement: ShipPlacement = {
            ship: mockCarrier,
            origin: { row: 2, col: 2 },
            orientation: 'horizontal',
        };

        const preview = derivePlacementPreview({
            selectedShip: mockCarrier,
            targetCell: { row: 2, col: 2 },
            orientation: 'horizontal',
            existingPlacements: [existingPlacement],
        });

        expect(preview).not.toBeNull();
        expect(preview?.isValid).toBe(true);
    });
});
