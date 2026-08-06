import { PlacementState } from '@/lib/domain/placement/models/PlacementState';

import type { PlacementCapabilities } from '../derive/placement-capabilites.types';

export function derivePlacementCapabilities(
    placementState: PlacementState,
): PlacementCapabilities {
    return {
        canPlaceShip: placementState === PlacementState.PLACING_SHIPS,
        canConfirmFleet: placementState === PlacementState.FLEET_READY,
        canInteractWithBoard:
            placementState === PlacementState.PLACING_SHIPS ||
            placementState === PlacementState.FLEET_READY,
    };
}
