import type { ShipPlacement } from '../models/ShipPlacement';

import type { ShipType } from '@/lib/domain/ships/models/ShipType';

type RemoveShipPlacementParams = {
    placements: ShipPlacement[];
    shipType: ShipType;
};

export function removeShipPlacement({
    placements,
    shipType,
}: RemoveShipPlacementParams): ShipPlacement[] {

    return placements.filter(
        placement => placement.ship.type !== shipType,
    );
}