import { derivePlacementCapabilities } from '../derivePlacementCapabilities';

import type { PlacementStats } from '../placement-stats.types';

describe('derivePlacementCapabilities', () => {
    it('does not allow fleet confirmation when ships remain and no ship is selected', () => {
        const stats: PlacementStats = {
            remainingShips: 2,
            remainingShipTypes: ['carrier', 'destroyer'],
        };

        expect(derivePlacementCapabilities(stats, null)).toEqual({
            canConfirmFleet: false,
        });
    });

    it('allows fleet confirmation when all ships are placed and no ship is selected', () => {
        const stats: PlacementStats = {
            remainingShips: 0,
            remainingShipTypes: [],
        };

        expect(derivePlacementCapabilities(stats, null)).toEqual({
            canConfirmFleet: true,
        });
    });

    it('does not allow fleet confirmation when the fleet is complete but a ship is selected', () => {
        const stats: PlacementStats = {
            remainingShips: 0,
            remainingShipTypes: [],
        };

        expect(derivePlacementCapabilities(stats, 'carrier')).toEqual({
            canConfirmFleet: false,
        });
    });

    it('does not allow fleet confirmation when ships remain and a ship is selected', () => {
        const stats: PlacementStats = {
            remainingShips: 2,
            remainingShipTypes: ['carrier', 'destroyer'],
        };

        expect(derivePlacementCapabilities(stats, 'battleship')).toEqual({
            canConfirmFleet: false,
        });
    });
});