import type {
    PlacementAvailability,
} from './placement-availability.types';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';

type DerivePlacementAvailabilityParams = {
    placements: ShipPlacement[];
    requiredFleet: BaseShip[];
};

export function derivePlacementAvailability({
    placements,
    requiredFleet,
}: DerivePlacementAvailabilityParams): PlacementAvailability {

    const placedShipTypes = new Set(
        placements.map(
            placement => placement.ship.type,
        ),
    );

    const remainingShipTypes = requiredFleet
        .map(ship => ship.type)
        .filter(
            shipType => !placedShipTypes.has(shipType),
        );

    return {
        remainingShipTypes,

        allShipsPlaced:
            remainingShipTypes.length === 0,
    };
}