import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';

type IsFleetCompleteParams = {
    placements: ShipPlacement[];
    requiredFleet?: BaseShip[];
};

export function isFleetComplete({
    placements,
    requiredFleet = STANDARD_FLEET,
}: IsFleetCompleteParams): boolean {
    const placedShipTypes = new Set(
        placements.map(placement => placement.ship.type),
    );

    return requiredFleet.length === placements.length &&
        requiredFleet.every(ship => placedShipTypes.has(ship.type));
}
