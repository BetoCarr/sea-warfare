import { derivePlacementCapabilities } from '../derivePlacementCapabilities';

import type { PlacementStats } from '../placement-stats.types';

describe('derivePlacementCapabilities', () => {
    it('allows fleet confirmation when there are no remaining ships', () => {
        const stats: PlacementStats = {
            remainingShips: 0,
            remainingShipTypes: [],
        };

        expect(derivePlacementCapabilities(stats)).toEqual({
            canConfirmFleet: true,
        });
    });

    it('does not allow fleet confirmation when ships remain', () => {
        const stats: PlacementStats = {
            remainingShips: 2,
            remainingShipTypes: ['carrier', 'destroyer'],
        };

        expect(derivePlacementCapabilities(stats)).toEqual({
            canConfirmFleet: false,
        });
    });
});