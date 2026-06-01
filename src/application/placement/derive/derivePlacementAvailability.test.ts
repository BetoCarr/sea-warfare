import { derivePlacementAvailability } from './derivePlacementAvailability';
import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';
import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

const mockCarrier: BaseShip = {
    type: 'carrier',
    size: 5,
};

const mockBattleship: BaseShip = {
    type: 'battleship',
    size: 4,
};

const mockCruiser: BaseShip = {
    type: 'cruiser',
    size: 3,
};

const mockSubmarine: BaseShip = {
    type: 'submarine',
    size: 3,
};

const mockDestroyer: BaseShip = {
    type: 'destroyer',
    size: 2,
};

const standardFleet: BaseShip[] = [
    mockCarrier,
    mockBattleship,
    mockCruiser,
    mockSubmarine,
    mockDestroyer,
];

function buildPlacement(ship: BaseShip, row: number, col: number): ShipPlacement {
    return {
        ship,
        origin: { row, col },
        orientation: 'horizontal',
    };
}

describe('derivePlacementAvailability', () => {
    it('should return all ship types as remaining when no placements exist', () => {
        const availability = derivePlacementAvailability({
            placements: [],
            requiredFleet: standardFleet,
        });

        expect(availability.remainingShipTypes).toEqual([
            'carrier',
            'battleship',
            'cruiser',
            'submarine',
            'destroyer',
        ]);
        expect(availability.allShipsPlaced).toBe(false);
    });

    it('should exclude ship types that are already placed', () => {
        const placements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockSubmarine, 2, 0),
        ];

        const availability = derivePlacementAvailability({
            placements,
            requiredFleet: standardFleet,
        });

        expect(availability.remainingShipTypes).toEqual([
            'battleship',
            'cruiser',
            'destroyer',
        ]);
        expect(availability.allShipsPlaced).toBe(false);
    });

    it('should mark allShipsPlaced when all required ships are placed', () => {
        const placements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockBattleship, 1, 0),
            buildPlacement(mockCruiser, 2, 0),
            buildPlacement(mockSubmarine, 3, 0),
            buildPlacement(mockDestroyer, 4, 0),
        ];

        const availability = derivePlacementAvailability({
            placements,
            requiredFleet: standardFleet,
        });

        expect(availability.remainingShipTypes).toEqual([]);
        expect(availability.allShipsPlaced).toBe(true);
    });

    it('should be deterministic for identical inputs', () => {
        const placements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockBattleship, 1, 0),
        ];

        const result1 = derivePlacementAvailability({
            placements,
            requiredFleet: standardFleet,
        });

        const result2 = derivePlacementAvailability({
            placements,
            requiredFleet: standardFleet,
        });

        expect(result1).toEqual(result2);
    });

    it('should not depend on placement order', () => {
        const placements1: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockBattleship, 1, 0),
            buildPlacement(mockCruiser, 2, 0),
        ];

        const placements2: ShipPlacement[] = [
            buildPlacement(mockCruiser, 2, 0),
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockBattleship, 1, 0),
        ];

        const availability1 = derivePlacementAvailability({
            placements: placements1,
            requiredFleet: standardFleet,
        });

        const availability2 = derivePlacementAvailability({
            placements: placements2,
            requiredFleet: standardFleet,
        });

        expect(availability1).toEqual(availability2);
    });
});
