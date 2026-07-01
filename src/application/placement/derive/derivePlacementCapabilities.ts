//DOCUMENTAR
import { PlacementState } from '@/lib/domain/placement/models/PlacementState';

export type PlacementCapabilities = {
    canPlaceShip: boolean;
    canConfirmFleet: boolean;
    canInteractWithBoard: boolean;
};

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
