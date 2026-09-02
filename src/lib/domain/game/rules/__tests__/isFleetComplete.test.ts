import { isFleetComplete } from '../isFleetComplete';

import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

describe('isFleetComplete', () => {
    function buildPlacement(shipType: string, row: number, col: number): ShipPlacement {
        const ship = STANDARD_FLEET.find(currentShip => currentShip.type === shipType)!;

        return {
            ship,
            origin: { row, col },
            orientation: 'horizontal',
        };
    }

    it('returns true when the placements exactly match the required fleet', () => {
        const placements: ShipPlacement[] = [
            buildPlacement('carrier', 0, 0),
            buildPlacement('battleship', 1, 0),
            buildPlacement('cruiser', 2, 0),
            buildPlacement('submarine', 3, 0),
            buildPlacement('destroyer', 4, 0),
        ];

        expect(isFleetComplete({ placements })).toBe(true);
    });

    it('returns false when at least one required ship is missing', () => {
        const placements: ShipPlacement[] = [
            buildPlacement('carrier', 0, 0),
            buildPlacement('battleship', 1, 0),
            buildPlacement('cruiser', 2, 0),
            buildPlacement('submarine', 3, 0),
        ];

        expect(isFleetComplete({ placements })).toBe(false);
    });

    it('returns false when placements include duplicates or extra ships', () => {
        const placements: ShipPlacement[] = [
            buildPlacement('carrier', 0, 0),
            buildPlacement('carrier', 1, 0),
            buildPlacement('battleship', 2, 0),
            buildPlacement('cruiser', 3, 0),
            buildPlacement('submarine', 4, 0),
            buildPlacement('destroyer', 5, 0),
        ];

        expect(isFleetComplete({ placements })).toBe(false);
    });
});
