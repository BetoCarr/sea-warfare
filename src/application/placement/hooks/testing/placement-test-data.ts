import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';

export const carrier = STANDARD_FLEET.find(ship => ship.type === 'carrier')!;
export const battleship = STANDARD_FLEET.find(ship => ship.type === 'battleship')!;
export const cruiser = STANDARD_FLEET.find(ship => ship.type === 'cruiser')!;
export const submarine = STANDARD_FLEET.find(ship => ship.type === 'submarine')!;
export const destroyer = STANDARD_FLEET.find(ship => ship.type === 'destroyer')!;

export function createDestroyerPlacement(): ShipPlacement {
    return {
        ship: destroyer,
        origin: { row: 0, col: 0 },
        orientation: 'horizontal',
    };
}

export function createCompleteFleetPlacements(): ShipPlacement[] {
    return [
        {
            ship: carrier,
            origin: { row: 0, col: 0 },
            orientation: 'horizontal',
        },
        {
            ship: battleship,
            origin: { row: 1, col: 0 },
            orientation: 'horizontal',
        },
        {
            ship: cruiser,
            origin: { row: 2, col: 0 },
            orientation: 'horizontal',
        },
        {
            ship: submarine,
            origin: { row: 3, col: 0 },
            orientation: 'horizontal',
        },
        {
            ship: destroyer,
            origin: { row: 4, col: 0 },
            orientation: 'horizontal',
        },
    ];
}
