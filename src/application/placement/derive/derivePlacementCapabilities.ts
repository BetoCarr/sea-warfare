import type { PlacementStats } from './placement-stats.types';
import type { PlacementCapabilities } from '../derive/placement-capabilites.types';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';

export function derivePlacementCapabilities(
    stats: PlacementStats,
    selectedShipType: ShipType | null,
): PlacementCapabilities {
    return {
        canConfirmFleet:
            stats.remainingShips === 0 &&
            selectedShipType === null,
    };
}
