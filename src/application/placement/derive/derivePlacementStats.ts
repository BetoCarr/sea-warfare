import type {
    PlacementStats,
} from './placement-stats.types';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';

type DerivePlacementStatsParams = {
    placements: ShipPlacement[];
    requiredFleet: BaseShip[];
};

export function derivePlacementStats({
    placements,
    requiredFleet,
}: DerivePlacementStatsParams): PlacementStats {

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
        remainingShips: remainingShipTypes.length,
        remainingShipTypes
    };
}