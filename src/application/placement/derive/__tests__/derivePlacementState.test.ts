import { derivePlacementState } from '../derivePlacementState';

import { PlacementState } from '@/lib/domain/placement/models/PlacementState';



import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

const createPlacement = (): ShipPlacement => ({
    ship: { type: 'destroyer', size: 2 },
    origin: { row: 0, col: 0 },
    orientation: 'horizontal',
});

describe('derivePlacementState', () => {
    it('returns placing ships when there are no placements', () => {
        expect(
            derivePlacementState({ placements: [], requiredFleetSize: 3 }),
        ).toBe(PlacementState.PLACING_SHIPS);
    });

    it('returns placing ships when placements are fewer than the required fleet size', () => {
        expect(
            derivePlacementState({
                placements: [createPlacement()],
                requiredFleetSize: 3,
            }),
        ).toBe(PlacementState.PLACING_SHIPS);
    });

    it('returns fleet ready when placements equal the required fleet size', () => {
        expect(
            derivePlacementState({
                placements: [createPlacement(), createPlacement(), createPlacement()],
                requiredFleetSize: 3,
            }),
        ).toBe(PlacementState.FLEET_READY);
    });

    it('returns fleet ready when placements exceed the required fleet size', () => {
        expect(
            derivePlacementState({
                placements: [
                    createPlacement(),
                    createPlacement(),
                    createPlacement(),
                    createPlacement(),
                ],
                requiredFleetSize: 3,
            }),
        ).toBe(PlacementState.FLEET_READY);
    });
});
