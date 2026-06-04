import { removeShipPlacement } from './removeShipPlacement';
import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';
import type { ShipPlacement } from '../models/ShipPlacement';

const mockCarrier: BaseShip = {
    type: 'carrier',
    size: 5,
};

const mockBattleship: BaseShip = {
    type: 'battleship',
    size: 4,
};

const mockDestroyer: BaseShip = {
    type: 'destroyer',
    size: 2,
};

function buildPlacement(ship: BaseShip, row: number, col: number): ShipPlacement {
    return {
        ship,
        origin: { row, col },
        orientation: 'horizontal',
    };
}

describe('removeShipPlacement', () => {
    it('removes the placement matching the provided ship type', () => {
        const placements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockDestroyer, 2, 1),
        ];

        const result = removeShipPlacement({
            placements,
            shipType: 'carrier',
        });

        expect(result).toEqual([buildPlacement(mockDestroyer, 2, 1)]);
    });

    it('leaves all other placements unchanged', () => {
        const placements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockBattleship, 1, 2),
            buildPlacement(mockDestroyer, 4, 4),
        ];

        const result = removeShipPlacement({
            placements,
            shipType: 'battleship',
        });

        expect(result).toEqual([
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockDestroyer, 4, 4),
        ]);
        expect(result).toHaveLength(2);
    });

    it('returns the original placements when the ship type does not exist', () => {
        const placements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockDestroyer, 2, 1),
        ];

        const result = removeShipPlacement({
            placements,
            shipType: 'submarine',
        });

        expect(result).toEqual(placements);
    });

    it('returns an empty array when removing from an empty placements collection', () => {
        const result = removeShipPlacement({
            placements: [],
            shipType: 'carrier',
        });

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
    });

    it('is deterministic for identical inputs', () => {
        const placements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockBattleship, 1, 1),
        ];

        const firstResult = removeShipPlacement({
            placements,
            shipType: 'carrier',
        });
        const secondResult = removeShipPlacement({
            placements,
            shipType: 'carrier',
        });

        expect(firstResult).toEqual(secondResult);
    });
    it('does not mutate the original placements collection', () => {
        const placements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockDestroyer, 2, 1),
        ];

        const original = [...placements];

        removeShipPlacement({
            placements,
            shipType: 'carrier',
        });

        expect(placements).toEqual(original);
    });
});
