
import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

import { UpsertShipPlacementResult } from '@/lib/domain/placement/models/UpsertShipPlacementResult';

export type PlacementMutations = {
    placeShip: (placement: ShipPlacement) => UpsertShipPlacementResult;

    confirmFleet: () => void;
};