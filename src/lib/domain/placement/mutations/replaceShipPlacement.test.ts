import { replaceShipPlacement } from './replaceShipPlacement';
import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';
import type { ShipPlacement } from '../models/ShipPlacement';

const mockCarrier: BaseShip = {
    type: 'carrier',
    size: 5,
};

const mockDestroyer: BaseShip = {
    type: 'destroyer',
    size: 2,
};

const mockCruiser: BaseShip = {
    type: 'cruiser',
    size: 3,
};

function buildPlacement(ship: BaseShip, row: number, col: number): ShipPlacement {
    return {
        ship,
        origin: { row, col },
        orientation: 'horizontal',
    };
}

describe('replaceShipPlacement', () => {
    it('successfully replaces an existing ship placement with a new valid placement', () => {
        const existingPlacements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockDestroyer, 3, 0),
        ];

        const result = replaceShipPlacement({
            existingPlacements,
            placement: buildPlacement(mockCarrier, 5, 2),
            boardSize: 10,
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.placements).toEqual([
                buildPlacement(mockDestroyer, 3, 0),
                buildPlacement(mockCarrier, 5, 2),
            ]);
        }
    });

    it('preserves all unrelated placements', () => {
        const existingPlacements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockDestroyer, 2, 4),
            buildPlacement(mockCruiser, 5, 1),
        ];

        const result = replaceShipPlacement({
            existingPlacements,
            placement: buildPlacement(mockCarrier, 4, 4),
            boardSize: 10,
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.placements).toEqual([
                buildPlacement(mockDestroyer, 2, 4),
                buildPlacement(mockCruiser, 5, 1),
                buildPlacement(mockCarrier, 4, 4),
            ]);
        }
    
    });

    it('returns a validation error when the replacement placement is invalid', () => {
        const existingPlacements: ShipPlacement[] = [
            buildPlacement(mockDestroyer, 0, 0),
        ];

        const result = replaceShipPlacement({
            existingPlacements,
            placement: buildPlacement(mockDestroyer, 9, 9),
            boardSize: 10,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBe('OUT_OF_BOUNDS');
        }
    });

    it('does not mutate the original placements collection', () => {
        const existingPlacements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockDestroyer, 2, 2),
        ];
        const originalSnapshot = existingPlacements.map((placement) => ({
            ...placement,
            origin: { ...placement.origin },
            ship: { ...placement.ship },
        }));

        replaceShipPlacement({
            existingPlacements,
            placement: buildPlacement(mockCarrier, 4, 4),
            boardSize: 10,
        });

        expect(existingPlacements).toEqual(originalSnapshot);
    });

    it('allows a ship to replace its own previous placement without self-overlap issues', () => {
        const existingPlacements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
        ];

        const result = replaceShipPlacement({
            existingPlacements,
            placement: buildPlacement(mockCarrier, 0, 5),
            boardSize: 10,
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.placements).toEqual([buildPlacement(mockCarrier, 0, 5)]);
        }
    });

    it('is deterministic for identical inputs', () => {
        const existingPlacements: ShipPlacement[] = [
            buildPlacement(mockCarrier, 0, 0),
            buildPlacement(mockDestroyer, 2, 2),
        ];

        const firstResult = replaceShipPlacement({
            existingPlacements,
            placement: buildPlacement(mockCarrier, 5, 5),
            boardSize: 10,
        });
        const secondResult = replaceShipPlacement({
            existingPlacements,
            placement: buildPlacement(mockCarrier, 5, 5),
            boardSize: 10,
        });

        expect(firstResult).toEqual(secondResult);
    });
});
