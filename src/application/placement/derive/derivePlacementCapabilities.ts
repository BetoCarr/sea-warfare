import type { PlacementStats } from './placement-stats.types';
import type { PlacementCapabilities } from '../derive/placement-capabilites.types';

export function derivePlacementCapabilities(
    stats: PlacementStats,
): PlacementCapabilities {
    return {
        canConfirmFleet: stats.remainingShips === 0,
    };
}
