import { derivePlacementPresentation } from '../derivePlacementPresentation';
import type { PlacementAvailability } from '../placement-availability.types';
import type { PlacementPreview } from '../placement-preview.types';

function buildAvailability(overrides: Partial<PlacementAvailability> = {}): PlacementAvailability {
    return {
        remainingShipTypes: ['carrier'],
        allShipsPlaced: false,
        ...overrides,
    };
}

function buildPreview(overrides: Partial<PlacementPreview> = {}): PlacementPreview {
    return {
        cells: [{ row: 2, col: 3 }],
        isValid: true,
        ...overrides,
    };
}

describe('derivePlacementPresentation', () => {
    it('returns "Fleet ready" when all ships are placed', () => {
        const presentation = derivePlacementPresentation({
            selectedShipType: 'destroyer',
            preview: buildPreview(),
            availability: buildAvailability({ allShipsPlaced: true }),
        });

        expect(presentation).toEqual({ message: 'Fleet ready'});
    });

    it('returns "Select ship" when no ship is selected', () => {
        const presentation = derivePlacementPresentation({
            selectedShipType: null,
            preview: buildPreview(),
            availability: buildAvailability(),
        });

        expect(presentation).toEqual({ message: 'Select ship'});
    });

    it('returns "Select position" when a ship is selected but no preview exists', () => {
        const presentation = derivePlacementPresentation({
            selectedShipType: 'destroyer',
            preview: null,
            availability: buildAvailability(),
        });

        expect(presentation).toEqual({ message: 'Select position' });
    });

    it('returns "Invalid placement" for an invalid preview', () => {
        const presentation = derivePlacementPresentation({
            selectedShipType: 'destroyer',
            preview: buildPreview({
                isValid: false,
                validationError: 'OVERLAP',
            }),
            availability: buildAvailability(),
        });

        expect(presentation).toEqual({
            message: 'Invalid placement',
            validationError: 'OVERLAP',
        });
    });

    it('propagates the validation error for invalid placements', () => {
        const presentation = derivePlacementPresentation({
            selectedShipType: 'carrier',
            preview: buildPreview({
                isValid: false,
                validationError: 'OUT_OF_BOUNDS',
            }),
            availability: buildAvailability(),
        });

        expect(presentation.message).toBe('Invalid placement');
        expect(presentation.validationError).toBe('OUT_OF_BOUNDS');
    });

    it('returns "Place ship" for a valid preview', () => {
        const presentation = derivePlacementPresentation({
            selectedShipType: 'submarine',
            preview: buildPreview({
                isValid: true,
                validationError: undefined,
            }),
            availability: buildAvailability(),
        });

        expect(presentation).toEqual({ message: 'Place ship' });
        expect(presentation.validationError).toBeUndefined();
    });

    it('is deterministic for identical inputs', () => {
        const params = {
            selectedShipType: 'battleship' as const,
            preview: buildPreview({
                cells: [{ row: 4, col: 5 }, { row: 4, col: 6 }],
                isValid: true,
            }),
            availability: buildAvailability(),
        };

        const firstResult = derivePlacementPresentation(params);
        const secondResult = derivePlacementPresentation(params);

        expect(firstResult).toEqual(secondResult);
    });
});
