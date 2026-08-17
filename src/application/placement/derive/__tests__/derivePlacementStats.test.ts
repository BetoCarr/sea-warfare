import { derivePlacementStats } from '../derivePlacementStats';

import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';
import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

const carrier: BaseShip = {
    type: 'carrier',
    size: 5,
};

const battleship: BaseShip = {
    type: 'battleship',
    size: 4,
};

const cruiser: BaseShip = {
    type: 'cruiser',
    size: 3,
};

const destroyer: BaseShip = {
    type: 'destroyer',
    size: 2,
};

function buildPlacement(ship: BaseShip): ShipPlacement {
    return {
        ship,
        origin: { row: 0, col: 0 },
        orientation: 'horizontal',
    };
}

describe('derivePlacementStats', () => {

    it('returns all required ships as remaining when no ships are placed', () => {
        const stats = derivePlacementStats({
            placements: [],
            requiredFleet: [
                carrier,
                battleship,
                cruiser,
                destroyer,
            ],
        });

        expect(stats).toEqual({
            remainingShips: 4,
            remainingShipTypes: [
                'carrier',
                'battleship',
                'cruiser',
                'destroyer',
            ],
        });
    });

    it('returns only unplaced ship types as remaining', () => {
        const stats = derivePlacementStats({
            placements: [
                buildPlacement(carrier),
                buildPlacement(cruiser),
            ],
            requiredFleet: [
                carrier,
                battleship,
                cruiser,
                destroyer,
            ],
        });

        expect(stats).toEqual({
            remainingShips: 2,
            remainingShipTypes: [
                'battleship',
                'destroyer',
            ],
        });
    });

    it('returns no remaining ships when the required fleet is complete', () => {
        const stats = derivePlacementStats({
            placements: [
                buildPlacement(carrier),
                buildPlacement(battleship),
                buildPlacement(cruiser),
                buildPlacement(destroyer),
            ],
            requiredFleet: [
                carrier,
                battleship,
                cruiser,
                destroyer,
            ],
        });

        expect(stats).toEqual({
            remainingShips: 0,
            remainingShipTypes: [],
        });
    });

    it('only considers ship types from the required fleet', () => {
        const stats = derivePlacementStats({
            placements: [
                buildPlacement(carrier),
            ],
            requiredFleet: [
                carrier,
                battleship,
                cruiser,
            ],
        });

        expect(stats.remainingShipTypes).toEqual([
            'battleship',
            'cruiser',
        ]);
        expect(stats.remainingShips).toBe(2);
    });
});