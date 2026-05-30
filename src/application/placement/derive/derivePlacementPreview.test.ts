import { derivePlacementPreview } from './derivePlacementPreview';
import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';
import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import type { PlacementInteractionState } from '../interactions/placement-interaction.types';

const mockCarrier: BaseShip = {
    type: 'carrier',
    size: 5,
};

const mockSubmarine: BaseShip = {
    type: 'submarine',
    size: 3,
};

function buildInteractionState(
    partial: Partial<PlacementInteractionState> = {},
): PlacementInteractionState {
    return {
        selectedShipType: null,
        orientation: 'horizontal',
        hoveredCell: null,
        ...partial,
    };
}

describe('derivePlacementPreview', () => {
    it('returns null when no ship is selected', () => {
        const interaction = buildInteractionState({
            hoveredCell: { row: 3, col: 4 },
        });

        const preview = derivePlacementPreview({
            selectedShip: null,
            interaction,
            existingPlacements: [],
        });

        expect(preview).toBeNull();
    });

    it('returns null when no hovered cell exists', () => {
        const interaction = buildInteractionState({
            hoveredCell: null,
            orientation: 'vertical',
        });

        const preview = derivePlacementPreview({
            selectedShip: mockSubmarine,
            interaction,
            existingPlacements: [],
        });

        expect(preview).toBeNull();
    });

    it('returns a valid preview for a valid placement', () => {
        const interaction = buildInteractionState({
            hoveredCell: { row: 2, col: 2 },
            orientation: 'horizontal',
        });

        const preview = derivePlacementPreview({
            selectedShip: mockSubmarine,
            interaction,
            existingPlacements: [],
        });

        expect(preview).not.toBeNull();
        expect(preview?.isValid).toBe(true);
        expect(preview?.validationError).toBeUndefined();
        expect(preview?.cells).toEqual([
            { row: 2, col: 2 },
            { row: 2, col: 3 },
            { row: 2, col: 4 },
        ]);
    });

    it('returns an invalid preview when placement exceeds board bounds', () => {
        const interaction = buildInteractionState({
            hoveredCell: { row: 0, col: 6 },
            orientation: 'horizontal',
        });

        const preview = derivePlacementPreview({
            selectedShip: mockCarrier,
            interaction,
            existingPlacements: [],
        });

        expect(preview).not.toBeNull();
        expect(preview?.isValid).toBe(false);
        expect(preview?.validationError).toBe('OUT_OF_BOUNDS');
    });

    it('returns an invalid preview when placement overlaps an existing ship', () => {
        const interaction = buildInteractionState({
            hoveredCell: { row: 1, col: 3 },
            orientation: 'vertical',
        });

        const existingPlacement: ShipPlacement = {
            ship: { type: 'destroyer', size: 2 },
            origin: { row: 2, col: 2 },
            orientation: 'horizontal',
        };

        const preview = derivePlacementPreview({
            selectedShip: mockSubmarine,
            interaction,
            existingPlacements: [existingPlacement],
        });

        expect(preview).not.toBeNull();
        expect(preview?.isValid).toBe(false);
        expect(preview?.validationError).toBe('OVERLAP');
    });

    it('derives coordinates correctly for horizontal orientation', () => {
        const interaction = buildInteractionState({
            hoveredCell: { row: 4, col: 1 },
            orientation: 'horizontal',
        });

        const preview = derivePlacementPreview({
            selectedShip: { type: 'cruiser', size: 4 },
            interaction,
            existingPlacements: [],
        });

        expect(preview).not.toBeNull();
        expect(preview?.cells).toEqual([
            { row: 4, col: 1 },
            { row: 4, col: 2 },
            { row: 4, col: 3 },
            { row: 4, col: 4 },
        ]);
    });

    it('derives coordinates correctly for vertical orientation', () => {
        const interaction = buildInteractionState({
            hoveredCell: { row: 1, col: 5 },
            orientation: 'vertical',
        });

        const preview = derivePlacementPreview({
            selectedShip: { type: 'cruiser', size: 4 },
            interaction,
            existingPlacements: [],
        });

        expect(preview).not.toBeNull();
        expect(preview?.cells).toEqual([
            { row: 1, col: 5 },
            { row: 2, col: 5 },
            { row: 3, col: 5 },
            { row: 4, col: 5 },
        ]);
    });

    it('is deterministic for identical inputs', () => {
        const interaction = buildInteractionState({
            hoveredCell: { row: 2, col: 2 },
            orientation: 'horizontal',
        });

        const params = {
            selectedShip: mockSubmarine,
            interaction,
            existingPlacements: [],
        };

        const firstPreview = derivePlacementPreview(params);
        const secondPreview = derivePlacementPreview(params);

        expect(firstPreview).toEqual(secondPreview);
    });
});
